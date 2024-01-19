import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { uploadImageToR2 } from '../../services/cloudflare';
import { sendToInstanceSubscribers } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { convertInstanceToChatCompletionMessageParams } from '../../src/utils';
import { updateInstanceStage } from './utils';

function generateUserMessageContent(imageStyle: string | null | undefined) {
  const baseMessage = `Based on the story so far, pick the most interesting character, object or scene from the most recent story addition and create a detailed image prompt to go with it.

  If the person is talking to a character, make it a closeup of that character (or a wide shot of main character talking to that character), but don't repeat images of a character more than once.
  If entering an indoor location, make it a scene of that location, etc.
  If the most interesting thing is an object, make it a closeup of that object.
  If the most interesting thing is a scene, make it a wide shot of that scene.

  It is vital that you maintain world, character, and style consistency. Reference past images to extract the most important details in maintaining a cohesive story.

  Only output the prompt as it will be feed directly to the image generation AI.`;

  const styleMessage = imageStyle
    ? `The generated image prompt must result in an image with this style. This is a hard requrement. Address it first so the image generator will priortize it properly: ${imageStyle}`
    : `Pick an art style that would best accompany the story and the story's genre.`;

  const message = `${baseMessage}\n\n${styleMessage}`;

  return message;
}

export async function createImage(instance: Instance & { messages: Message[] }) {
  let updatedInstance = await updateInstanceStage(instance, InstanceStage.CREATE_IMAGE_START);

  // Step 1 - Use Vision API to create a prompt for the image
  let messages = convertInstanceToChatCompletionMessageParams(instance);
  let modifiedMessages = messages
    .map((message) => {
      if (message.role == 'function' && message.name == 'generate_image') {
        return {
          role: 'assistant',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: message.content,
                detail: 'high',
              },
            },
          ],
        };
      } else {
        return message;
      }
    })
    .filter((message) => message.role != 'function');

  modifiedMessages = [
    ...(modifiedMessages as any),
    {
      role: 'user',
      content: generateUserMessageContent(instance.imageStyle),
    },
  ];

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: modifiedMessages as ChatCompletionMessageParam[],
    max_tokens: 256,
  });
  const endTime = Date.now();

  if (!response.choices[0].message.content) {
    throw new Error('No content in response');
  }

  logNonStreamedOpenAIResponse(instance.userId, modifiedMessages as ChatCompletionMessageParam[], response, endTime - startTime);

  // Step 2 - Use DALL-E to generate an image that matches the art style of the story for a new concept
  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: response.choices[0].message.content,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
  });

  const imageURL = imageResponse.data[0].url!;

  updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.function,
          content: imageURL,
          name: 'generate_image',
        },
      },
      history: {
        push: updatedInstance.stage,
      },
      stage: InstanceStage.CREATE_IMAGE_FINISH,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceStageChanged,
    data: {
      instanceId: instance.id,
      stage: updatedInstance.stage,
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instance.id,
      message: updatedInstance.messages[updatedInstance.messages.length - 1],
    },
  });

  uploadImageToR2(imageURL, updatedInstance.messages[updatedInstance.messages.length - 1].id);

  return updatedInstance;
}

export async function resetCreateImage(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.function && lastMessage.name === 'generate_image') {
    await db.message.delete({
      where: {
        id: lastMessage.id,
      },
    });
  }

  const updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      history: {
        push: instance.stage,
      },
      stage: instance.history[instance.history.length - 2], // Go back to the previous stage (could be CONTINUE_STORY_FINISH or INTRODUCE_STORY_FINISH)
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return updatedInstance;
}
