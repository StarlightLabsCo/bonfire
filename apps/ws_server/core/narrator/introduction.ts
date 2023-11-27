import { logStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../services/elevenlabs';
import { sendToInstanceSubscribers } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { convertInstanceToChatCompletionMessageParams } from '../../src/utils';

export async function introduceStory(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
      stage: InstanceStage.CREATE_OUTLINE_FINISH, // TODO: is there a more unified way to do this, maybe just an if statement at the top of the function?
    },
    data: {
      messages: {
        create: {
          role: MessageRole.assistant,
          content: '',
          name: 'introduction',
        },
      },
      stage: InstanceStage.INTRODUCE_STORY_START,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  sendToInstanceSubscribers(updatedInstance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: updatedInstance.id,
      message: updatedInstance.messages[updatedInstance.messages.length - 1],
    },
  });

  await initSpeechStreamConnection(updatedInstance.id);

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
        continue;
      }

      if (args.includes('}')) {
        continue;
      }

      content += args;
      content = content.replace(/\\n/g, '\n');
      content = content.replace(/\\"/g, '"');
      content = content.replace(/\\'/g, "'");

      sendToInstanceSubscribers(updatedInstance.id, {
        type: StarlightWebSocketResponseType.messageUpsert,
        data: {
          instanceId: updatedInstance.id,
          message: {
            ...updatedInstance.messages[updatedInstance.messages.length - 1],
            content,
            updatedAt: new Date(),
          },
        },
      });

      let cleanedArgs = args.replace(/\\n/g, '\n');
      cleanedArgs = cleanedArgs.replace(/\\"/g, '"');
      cleanedArgs = cleanedArgs.replace(/\\'/g, "'");

      appendToSpeechStream(instance.id, cleanedArgs);
    } catch (err) {
      console.error(err);
    }
  }

  endSpeechStream(instance.id);

  const endTime = Date.now();

  // Cleanup - need to make this more robust and cleaner
  buffer = buffer.replace(/\\n/g, '\n');
  buffer = buffer.replace(/\\"/g, '"');
  buffer = buffer.replace(/\\'/g, "'");
  buffer = buffer.replace(new RegExp(`{\\s*"introduction"\\s*:\\s*"`, 'g'), '');
  buffer = buffer.replace(/"\s*\}\s*$/, '');

  sendToInstanceSubscribers(updatedInstance.id, {
    type: StarlightWebSocketResponseType.messageReplace,
    data: {
      instanceId: updatedInstance.id,
      messageId: updatedInstance.messages[updatedInstance.messages.length - 1].id,
      content: buffer,
    },
  });

  logStreamedOpenAIResponse(updatedInstance.userId, messages, chunks, endTime - startTime);

  updatedInstance = await db.instance.update({
    where: {
      id: updatedInstance.id,
    },
    data: {
      messages: {
        update: {
          where: {
            id: updatedInstance.messages[updatedInstance.messages.length - 1].id,
          },
          data: {
            content: buffer,
          },
        },
      },
      stage: InstanceStage.INTRODUCE_STORY_FINISH,
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
