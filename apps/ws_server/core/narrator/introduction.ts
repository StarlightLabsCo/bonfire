import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { MessageRole } from 'database';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { sendToUser } from '../../src/connection';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../services/elevenlabs';

export async function introduceStory(
  userId: string,
  connectionId: string,
  instanceId: string,
  messages: ChatCompletionMessageParam[],
) {
  const message = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: '',
      role: MessageRole.assistant,
      name: 'introduction',
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

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    stream: true,
    functions: [
      {
        name: 'introduce_story_and_characters',
        description:
          'Given the pre-created plan, paint a vibrant and irrestiable hook of the very beginning of story, the exposition. Colorfully show the setting, and characters ending with a clear decision point where the story begins for the players. Do not skip any major events or decisions. Do not reveal the plan of the story. Do not hint about the path ahead or reveal the outcome. Keep it short and punchy. Do not exceed a paragraph. Be creative! No newlines.',
        parameters: {
          type: 'object',
          properties: {
            introduction: {
              type: 'string',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'introduce_story_and_characters',
    },
  });

  // Handle streaming response
  let chunks = [];
  let buffer = '';

  for await (const chunk of response) {
    chunks.push(chunk);
    let args = chunk.choices[0].delta.function_call?.arguments;

    try {
      if (!args) continue;

      buffer += args;
      buffer = buffer.replace(/\\n/g, '\n');

      // Remove the param key from the stream
      if (
        `{\n"introduction":"`.includes(buffer) ||
        `{\n"introduction": "`.includes(buffer) ||
        `{\n "introduction": "`.includes(buffer) ||
        `{\n  "introduction": "`.includes(buffer) ||
        `{"introduction": "`.includes(buffer) ||
        `{"introduction":"`.includes(buffer) ||
        `{ "introduction": "`.includes(buffer) ||
        `{ "introduction":"`.includes(buffer)
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

  const endTime = Date.now();

  // Cleanup - need to make this more robust and cleaner
  buffer = buffer.replace(/\\n/g, '');
  buffer = buffer.replace(new RegExp(`{\\s*"introduction"\\s*:\\s*"`, 'g'), '');
  buffer = buffer.replace(/"\s*\}\s*$/, '');

  sendToUser(connectionId, {
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
    { role: MessageRole.assistant, content: updatedMessage.content, name: 'introduction' },
  ] as ChatCompletionMessageParam[];
}
