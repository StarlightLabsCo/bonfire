import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { uploadImageToR2 } from '../../services/cloudflare';
import { sendToInstanceSubscribers } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { convertInstanceToChatCompletionMessageParams } from '../../src/utils';
import { updateInstanceStage } from './utils';

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
      content: `Based on the story, pick the most interesting concept, or character from the most recent story addition and create a detailed image prompt to go with it. This could be a scene, a character, or an object. Avoid breaking the listener's immersion at all costs. If the person is talking to a character, make it a closeup of that character (or the main character talking to that character). If entering an indoor location, make it a scene of that location, etc. If there are no prior images, pick an art style that would best accompany the story and the story's genre, and stick wth it throughout. Make it epic! We want to create jaw-dropping images to bring the story to life.

      It is vital that you maintain world, character, and style consistency. Reference past images and expand the prompt as much as possible to ensure the images present a cohesive story. Do not create repetitive images.

      Only output the prompt as it will be feed directly to the image generation AI.`,
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
