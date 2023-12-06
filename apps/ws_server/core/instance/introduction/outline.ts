import { db } from '../../../services/db';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';
import { sendToInstanceSubscribers } from '../../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function createOutline(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  console.log(messages);

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: [
      ...messages,
      {
        role: 'user',
        content: `Create a concise but detailed outline for the requested story:

        ${instance.description}

        Describe the overarching story, the main characters, twists, and the primary objective. What quirks exist in this world? How do you make it unique and memorable? How do you make it feel real and grounded?

        This outline should also include smaller scale story beats and memorable moments, but should never allow the story to get cluttered. The consequences of each plot point should effect every other plot point. Be concrete, and avoid vaguness. Name characters, locations, events in depth while making sure to include the listener in the story. Always think a few steps ahead. Make the story feel alive! This outline will only be referenced by yourself, the storyteller, and should not be shared with the listener.

        Do not just repeat the requested story, actually create an outline.

        Keep it concise, but detailed! This outline should not be longer than a few sentences.`,
      },
    ],
    model: 'gpt-4-32k-0613',
  });
  const endTime = Date.now();

  if (!response.choices[0].message) {
    throw new Error('No message returned from GPT-4');
  }

  const plan = response.choices[0].message.content as string;

  logNonStreamedOpenAIResponse(instance.userId, messages, response, endTime - startTime);

  const updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: plan,
          name: 'story_outline',
        },
      },
      history: {
        push: instance.stage,
      },
      stage: InstanceStage.CREATE_OUTLINE_FINISH,
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
    type: StarlightWebSocketResponseType.instanceCreated,
    data: {
      instanceId: instance.id,
    },
  });

  return updatedInstance;
}

export async function resetCreateOutline(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.system && lastMessage.name === 'story_outline') {
    await db.message.delete({
      where: {
        id: lastMessage.id,
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
