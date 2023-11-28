import { db } from '../../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { sendToInstanceSubscribers } from '../../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../../services/elevenlabs';
import { logStreamedOpenAIResponse, openai } from '../../../services/openai';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';

export async function continueStory(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.assistant,
          content: '',
          name: 'story_beat',
        },
      },
      stage: InstanceStage.CONTINUE_STORY_START,
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

      appendToSpeechStream(updatedInstance.id, cleanedArgs);
    } catch (err) {
      console.error(err);
    }
  }

  endSpeechStream(updatedInstance.id);
  const endTime = Date.now();

  // Cleanup - need to make this more robust and cleaner
  buffer = buffer.replace(/\\n/g, '\n');
  buffer = buffer.replace(/\\"/g, '"');
  buffer = buffer.replace(/\\'/g, "'");
  buffer = buffer.replace(new RegExp(`{\\s*"story"\\s*:\\s*"`, 'g'), '');
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
      stage: InstanceStage.CONTINUE_STORY_FINISH,
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
