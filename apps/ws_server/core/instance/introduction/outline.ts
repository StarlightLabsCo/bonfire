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
        content:
          'Craft a detailed plan for the requested story. Describe, fully, the overarching story, the main characters, twists, and the main goal. This outline should also include smaller scale beats and memorable moments, but should never allow the story to get so cluttered that it is no longer followable. The consequences of each plot point should effect every other plot point. Be specific in your plan, naming characters, locations, events in depth while making sure to include the listener in the story. Always think a few steps ahead to make the story feel alive. This outline will only be referenced by yourself, the storyteller, and should not be shared with the listener. Keep it concise, but detailed! Return it as a JSON object with the key "plan".',
      },
    ],
    model: 'gpt-4-1106-preview',
    response_format: {
      type: 'json_object',
    },
  });
  const endTime = Date.now();

  if (!response.choices[0].message.content) {
    throw new Error('No message returned from GPT-4');
  }

  // DEBUG
  // console.log(response.choices[0].message);
  // console.log(response.choices[0].message.content);
  // const fs = require('fs');
  // fs.writeFileSync('story_outline.json', response.choices[0].message.content);
  // DEBUG END

  logNonStreamedOpenAIResponse(instance.userId, messages, response, endTime - startTime);

  const updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: response.choices[0].message.content,
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
