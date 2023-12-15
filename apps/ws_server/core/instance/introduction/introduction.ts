import { logStreamedOpenAIResponse, openai } from '../../../services/openai';
import { db } from '../../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { appendToSpeechStream, endSpeechStream, initSpeechStreamConnection } from '../../../services/elevenlabs';
import { sendToInstanceSubscribers } from '../../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';

export async function introduceStory(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
      stage: InstanceStage.CREATE_OUTLINE_FINISH,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.assistant,
          content: '',
          name: 'introduction',
        },
      },
      history: {
        push: instance.stage,
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

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceStageChanged,
    data: {
      instanceId: instance.id,
      stage: updatedInstance.stage,
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
        content: `Given the story outline, create a hook to the beginning of this text-adventure game. Remember that the player has no prior information so make sure to introduce anything you mention. Vibrantly show the setting & characters. If the player hasn't met a character yet, they won't know who they are. End with a clear decision point for the player, which should not be explicitly described. Do not break the 4th wall, or ask the player to make a choice.

        Be concrete and avoid vaguness. Do not refer to fate, or destiny. Do not foreshadow any future events under any circumstances. Do not prescribe actions or thoughts to the player, as this removes their agency.

        Lean towards a hyper-detailed play-by-play telling of events.

        Do not under any circumstances ask any questions to the player e.g. \"Will you accept this quest?\", "Will you tempt fate?". Only output the story.

        Keep it concsise and punchy! DO NOT under any circumstance exceed 5 sentences (although you may use newlines). Most importantly, be creative, and create an introduction that wows the player and makes it unthinkable not to play further!`,
      },
    ],
    model: 'gpt-4-32k-0613',
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
      history: {
        push: updatedInstance.stage,
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

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceStageChanged,
    data: {
      instanceId: instance.id,
      stage: updatedInstance.stage,
    },
  });

  return updatedInstance;
}

export async function resetIntroduceStory(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.assistant && lastMessage.name === 'introduction') {
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
      stage: instance.history[instance.history.length - 2],
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
