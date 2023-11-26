import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../services/openai';
import { db } from '../services/db';
import { Instance, Message, MessageRole } from 'database';
import { uploadImageToR2 } from '../services/cloudflare';
import { sendToInstanceSubscribers } from '../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function createImage(instance: Instance & { messages: Message[] }) {
  let modifiedMessages = instance.messages
    .map((message) => {
      if (message.role == 'function' && message.name == 'generate_image') {
        return {
          role: 'assistant',
          content: [
            {
              type: 'image_url',
              image_url: message.content,
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
      role: 'system',
      content: `Based on the story, pick the most interesting concept, or character from the most recent story addition and create a detailed image prompt to go with it. This could be a scene, a character, or an object. Keep it consistent with the story, and the style of past images. Ensure that your prompt describes an image that is guranteed to be perceived as symbolic within the story, and avoid breaking the listener's immersion at all costs. Only output the prompt as it will be feed directly to the image generation AI.`,
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

  logNonStreamedOpenAIResponse(instance.id, modifiedMessages, response, endTime - startTime);

  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: response.choices[0].message.content,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
  });

  const imageURL = imageResponse.data[0].url!;

  const updatedInstance = await db.instance.update({
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
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instance.id,
      message: updatedInstance.messages[updatedInstance.messages.length - 1],
    },
  });

  uploadImageToR2(imageURL, updatedInstance.messages[updatedInstance.messages.length - 1].id);

  return updatedInstance;
}
