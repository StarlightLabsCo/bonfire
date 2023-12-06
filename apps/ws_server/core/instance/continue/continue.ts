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
      history: {
        push: instance.stage,
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
        role: 'user',
        content: `Continue narrating the story based on the previous messages, integrating what the listener said, but also not letting them take over the story. Keep it grounded in the world you created, and make sure to keep the story moving forward, but keep it concise and short! This is a text adventure game, not a novel.

        Feel free to inject drama that will surprise the player, but keep these dramatic elements relevant to the story outline and consistent with the world. Your descriptions of the events of the story must not, under any circumstances, use vague language.

        Make sure to keep track of the narrative tempo of your story as well. If the action in the story are low-stakes and mundane, take on a more reflective and descriptive voice, with the goal of providing the listener with as much circumstantial information on which to act as possible. If the actions that are transpiring in the story are climactic and consequential, portray events exactly as they happen with a thorough "play-by-play" and assuming a tone that is more cinematic.

        Do not mention the dice roll, or other systems occuring behind the scenes in the story. Do not refer to fate, or destiny, or any foreshadowing of future events under any circumstances. Do not prescribe actions or thoughts to the player, as this removes their agency. DO NOT under any circumstance exceed three sections of text and do not mention sections. Prefer to keep it shorter than that anyways. Keep it concise and punchy! No one likes a long-winded storyteller!`,
      },
    ],
    model: 'gpt-4-1106-preview',
    stream: true,
  });

  // Handle streaming response
  let chunks = [];
  let buffer = '';
  let content = '';

  for await (const chunk of response) {
    chunks.push(chunk);
    let args;
    if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
      args = chunk.choices[0].delta.content;
    } else {
      continue;
    }

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

  console.log('buffer', buffer);

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
      history: {
        push: updatedInstance.stage,
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

export async function resetContinueStory(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.assistant && lastMessage.name === 'story_beat') {
    await db.message.delete({
      where: {
        id: lastMessage.id,
      },
    });

    sendToInstanceSubscribers(instance.id, {
      type: StarlightWebSocketResponseType.messageDeleted,
      data: {
        instanceId: instance.id,
        messageId: lastMessage.id,
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
      stage: instance.history[instance.history.length - 1],
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
