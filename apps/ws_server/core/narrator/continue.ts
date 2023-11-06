import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from '../../services/db';
import { MessageRole } from 'database';
import { sendToUser } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../services/elevenlabs';
import { openai } from '../../services/openai';
import { embedMessage } from '../context/embedding';

export async function continueStory(connectionId: string, instanceId: string, messages: ChatCompletionMessageParam[]) {
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

  sendToUser(connectionId, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instanceId,
      message: message,
    },
  });

  await initSpeechStreamConnection(connectionId);

  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4',
    stream: true,
    functions: [
      {
        name: 'continue_story',
        description:
          'Continue narratoring the story based on the previous messages, integrating what the players said, but also not letting them take over the story. Keep it grounded in the world you created, and make sure to keep the story moving forward, but with correct pacing. Stories should be interesting, but not too fast paced, and not too slow. Expand upon the plan made previously.',
        parameters: {
          type: 'object',
          properties: {
            story: {
              type: 'string',
              description: 'The new story to add to the existing story. Keep it short and punchy. No newlines.',
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
  let buffer = '';

  for await (const chunk of response) {
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

      sendToUser(connectionId, {
        type: StarlightWebSocketResponseType.messageAppend,
        data: {
          instanceId: instanceId,
          messageId: message.id,
          delta: args,
        },
      });

      appendToSpeechStream(connectionId, args);
    } catch (err) {
      console.error(err);
    }
  }

  endSpeechStream(connectionId);

  // Cleanup - need to make this more robust and cleaner
  buffer = buffer.replace(/\\n/g, '');
  buffer = buffer.replace(new RegExp(`{\\s*"story"\\s*:\\s*"`, 'g'), '');
  buffer = buffer.replace(/"\s*\}\s*$/, '');

  sendToUser(connectionId, {
    type: StarlightWebSocketResponseType.messageReplace,
    data: {
      instanceId: instanceId,
      messageId: message.id,
      content: buffer,
    },
  });

  const updatedMessage = await db.message.update({
    where: {
      id: message.id,
    },
    data: {
      content: buffer,
    },
  });

  embedMessage(updatedMessage.id, buffer);

  return [
    ...messages,
    { role: MessageRole.assistant, content: updatedMessage.content, name: 'next_story_beat' },
  ] as ChatCompletionMessageParam[];
}
