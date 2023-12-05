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
        content: `Given the story outline you created above, create a vibrant and irresistible hook of the very beginning of story (aka. the exposition). Remember that the player has not seen any of the information above, so make sure to introduce anything you mention properly. Colorfully show the setting and characters ending with a clear decision point where the story begins for the player. Avoid vagueness! You can use poetric pose, but be specific and concreate in it's use. Do not refer to fate, or destiny, or any foreshadowing of future events. Lean towards a play-by-play telling of events. Also vary the length of responses to keep pacing interesting! Don't ask any questions to the player e.g. \"Will you accept this quest?\". Make sure to expand enough that it immediately gives the player context of the world, and the situation, while also immeidately hooking them to play further, but not losing the attention of the player. Do not skip any major events or decisions. (I would rather you explain a major event and make a small action beat to keep the player engaged rather than a big wall of text). You're allowed to use multple lines, but don't make it too long (but don't make it more than 2-3 sections of text). Keep it concsise and punchy! Be creative!

        Return this as a JSON object with a single key "story" which is of type string.`,
      },
    ],
    model: 'gpt-4-1106-preview',
    stream: true,
    response_format: {
      type: 'json_object',
    },
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
