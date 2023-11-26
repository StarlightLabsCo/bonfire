import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { Instance, Message, MessageRole } from 'database';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../services/elevenlabs';
import { sendToInstanceSubscribers } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function introduceStory(instance: Instance & { messages: Message[] }) {
  const message = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instance.id,
        },
      },
      content: '',
      role: MessageRole.assistant,
      name: 'introduction',
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instance.id,
      message: message,
    },
  });

  await initSpeechStreamConnection(userId);

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    stream: true,
    functions: [
      {
        name: 'introduce_story_and_characters',
        description:
          'Given the pre-created plan, paint a vibrant and irresistible hook of the very beginning of story, the exposition. Colorfully show the setting and characters ending with a clear decision point where the story begins for the listener. Do not skip any major events or decisions. Reveal portions of the plan that will effectively set the stage and engage the listener. It is most important that this introduction immerses the listener in the world. Do not exceed a paragraph. Be creative!',
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

      content += args;
      content = content.replace(/\\n/g, '\n');
      content = content.replace(/\\"/g, '"');
      content = content.replace(/\\'/g, "'");

      sendToInstanceSubscribers(instance.id, {
        type: StarlightWebSocketResponseType.messageUpsert,
        data: {
          instanceId: instance.id,
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
  buffer = buffer.replace(new RegExp(`{\\s*"introduction"\\s*:\\s*"`, 'g'), '');
  buffer = buffer.replace(/"\s*\}\s*$/, '');

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.messageReplace,
    data: {
      instanceId: instance.id,
      messageId: message.id,
      content: buffer,
    },
  });

  logStreamedOpenAIResponse(instance.userId, messages, chunks, endTime - startTime);

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
