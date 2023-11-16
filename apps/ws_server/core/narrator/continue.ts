import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from '../../services/db';
import { MessageRole } from 'database';
import { sendToUser } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../services/elevenlabs';
import { logStreamedOpenAIResponse, openai } from '../../services/openai';

export async function continueStory(userId: string, instanceId: string, messages: ChatCompletionMessageParam[]) {
  // TODO: trigger both async commands at once
  const message = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: '',
      role: MessageRole.assistant,
      name: 'next_story_beat',
    },
  });

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instanceId,
      message: message,
    },
  });

  await initSpeechStreamConnection(userId);

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: [
      ...messages,
      {
        role: 'system',
        content: `Continue narrating the story based on the previous messages, integrating what the listener said, but also not letting them take over the story. Keep it grounded in the world you created, and make sure to keep the story moving forward. Feel free to inject drama that will surprise the player, but keep these dramatic elements relevant to the story plan and consistent with the world you have created. Your descriptions of the occurrences in your continuation of the story must not, under any circumstances, use vague language to obfuscate the listener's understanding of the narrative. \n\nMake sure to keep track of the narrative tempo of your story as well. If the actions that are transpiring in the story are low-stakes and mundane, take on a more reflective and descriptive voice, intent on providing the listener with as much circumstantial information on which to act as possible. If the actions that are transpiring in the story are climactic and consequential, portray events exactly as they happen, preserving the causality of moment in the form of an overly thorough "play-by-play" and assuming a tone that is more cinematic Expand upon the plan made previously.`,
      },
    ],
    model: 'gpt-4-1106-preview',
    stream: true,
    functions: [
      {
        name: 'continue_story',
        parameters: {
          type: 'object',
          properties: {
            story: {
              type: 'string',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'continue_story',
    },
  });

  // Handle streaming response
  let chunks = [];
  let buffer = '';
  let content = '';

  for await (const chunk of response) {
    chunks.push(chunk);
    let args = chunk.choices[0].delta.function_call?.arguments;

    try {
      if (!args) continue;

      buffer += args;
      buffer = buffer.replace(/\\n/g, '\n');

      // Remove the param key from the stream
      if (
        `{\n"story":"`.includes(buffer) ||
        `{\n"story": "`.includes(buffer) ||
        `{\n "story": "`.includes(buffer) ||
        `{\n  "story": "`.includes(buffer) ||
        `{"story": "`.includes(buffer) ||
        `{"story":"`.includes(buffer) ||
        `{ "story": "`.includes(buffer) ||
        `{ "story":"`.includes(buffer)
      ) {
        console.log('skipping beginning');
        continue;
      }

      if (args.includes('}')) {
        console.log('skipping end');
        continue;
      }

      content += args;
      content = content.replace(/\\n/g, '\n');
      content = content.replace(/\\"/g, '"');
      content = content.replace(/\\'/g, "'");

      sendToUser(userId, {
        type: StarlightWebSocketResponseType.messageUpsert,
        data: {
          instanceId: instanceId,
          message: {
            ...message,
            content,
            updatedAt: new Date(),
          },
        },
      });

      let cleanedArgs = args.replace(/\\n/g, '\n');
      cleanedArgs = cleanedArgs.replace(/\\"/g, '"');
      cleanedArgs = cleanedArgs.replace(/\\'/g, "'");

      appendToSpeechStream(userId, cleanedArgs);
    } catch (err) {
      console.error(err);
    }
  }

  endSpeechStream(userId);
  const endTime = Date.now();

  // Cleanup - need to make this more robust and cleaner
  buffer = buffer.replace(/\\n/g, '\n');
  buffer = buffer.replace(/\\"/g, '"');
  buffer = buffer.replace(/\\'/g, "'");
  buffer = buffer.replace(new RegExp(`{\\s*"story"\\s*:\\s*"`, 'g'), '');
  buffer = buffer.replace(/"\s*\}\s*$/, '');

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.messageReplace,
    data: {
      instanceId: instanceId,
      messageId: message.id,
      content: buffer,
    },
  });

  logStreamedOpenAIResponse(userId, messages, chunks, endTime - startTime);

  const updatedMessage = await db.message.update({
    where: {
      id: message.id,
    },
    data: {
      content: buffer,
    },
  });

  return [
    ...messages,
    { role: MessageRole.assistant, content: updatedMessage.content, name: 'story_beat' },
  ] as ChatCompletionMessageParam[];
}
