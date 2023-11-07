import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { openai } from '../services/openai';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { sendToUser } from '../src/connection';
import { db } from '../services/db';
import { MessageRole } from 'database';

export async function createImage(connectionId: string, instanceId: string, messages: ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert artist in the field of prompt engineering based art. Your job is to take a story and generate the best image to go with it. Here are some examples of prompts as reference:\n' +
          'Digital Art / Concept Art\n' +
          'Prompt: concept art of dragon flying over town, clouds. digital artwork, illustrative, painterly, matte painting, highly detailed, cinematic composition\n' +
          'Ethereal Fantasy Art\n' +
          'Prompt: ethereal fantasy concept art of sorceress casting spells. magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy\n' +
          'Photography\n' +
          'Prompt: cinematic photo of a woman sitting at a cafe. 35mm photograph, film, bokeh, professional, 4k, highly detailed\n' +
          'Cinematography\n' +
          'Prompt: cinematic film still, stormtrooper taking aim. shallow depth of field, vignette, highly detailed, high budget Hollywood movie, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy\n' +
          'Isometric\n' +
          'Prompt: isometric style farmhouse from RPG game, unreal engine, vibrant, beautiful, crisp, detailed, ultra detailed, intricate\n' +
          'Pixel Art\n' +
          'Prompt: isometric pixel-art of wizard working on spells. low-res, blocky, pixel art style, 16-bit graphics\n' +
          'Anime\n' +
          'Prompt: anime artwork an empty classroom. anime style, key visual, vibrant, studio anime, highly detailed\n' +
          '\n' +
          'This are but a few examples of the infinitely many prompts you could use. Be creative!\n' +
          '\n' +
          'Story beat to generate image from: \n',
      },
      messages[messages.length - 1],
    ],
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'generate_image',
        description:
          'Based on the story, pick the most interesting concept, character, or idea from the most recent story addition and generate an image to go with it. This could be a scene, a character, or an object. Use the examples to guide you. Keep it consistent with the story. Describe a prompt, and negative prompt.',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'generate_image',
    },
  });

  if (!response.choices[0].message.function_call) {
    throw new Error('No choices returned from GPT-4');
  }

  const data = JSON.parse(response.choices[0].message.function_call.arguments);

  // TODO: need to save the image to cloud storage
  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: data.prompt,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
  });

  const imageURL = imageResponse.data[0].url!;

  const message = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      role: MessageRole.function,
      content: imageURL,
      name: 'generate_image',
    },
  });

  sendToUser(connectionId, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instanceId,
      message: message,
    },
  });

  return [
    ...messages,
    { role: MessageRole.function, content: imageURL, name: 'generate_image' },
  ] as ChatCompletionMessageParam[];
}
