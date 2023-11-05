import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { generateImage } from '../services/sdxl';
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
          'Negative Prompt: photo, photorealistic, realism, ugly\n' +
          'Ethereal Fantasy Art\n' +
          'Prompt: ethereal fantasy concept art of sorceress casting spells. magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy\n' +
          'Negative Prompt: photographic, realistic, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white\n' +
          'Photography\n' +
          'Prompt: cinematic photo of a woman sitting at a cafe. 35mm photograph, film, bokeh, professional, 4k, highly detailed\n' +
          'Negative Prompt: drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly\n' +
          'Cinematography\n' +
          'Prompt: cinematic film still, stormtrooper taking aim. shallow depth of field, vignette, highly detailed, high budget Hollywood movie, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy\n' +
          'Negative Prompt: anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured\n' +
          'Isometric\n' +
          'Prompt: isometric style farmhouse from RPG game, unreal engine, vibrant, beautiful, crisp, detailed, ultra detailed, intricate\n' +
          'Negative Prompt: deformed, mutated, ugly, disfigured, blur, blurry, noise, noisy, realistic, photographic\n' +
          'Pixel Art\n' +
          'Prompt: isometric pixel-art of wizard working on spells. low-res, blocky, pixel art style, 16-bit graphics\n' +
          'Negative Prompt: sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic\n' +
          'Anime\n' +
          'Prompt: anime artwork an empty classroom. anime style, key visual, vibrant, studio anime, highly detailed\n' +
          'Negative Prompt: photo, deformed, black and white, realism, disfigured, low contrast\n' +
          '\n' +
          'This are but a few examples of the infinitely many prompts you could use. Be creative!\n' +
          '\n' +
          'Story beat to generate image from: \n',
      },
      messages[messages.length - 1],
    ],
    model: 'gpt-4',
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
            negative_prompt: {
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
  const imageURL = await generateImage('', data.prompt, data.negative_prompt || ''); // TODO: add user id so we can log it properly

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
