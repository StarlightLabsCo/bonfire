import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';
import { db } from '../../../services/db';
import { updateInstanceStage } from '../utils';
import { sendToInstanceSubscribers } from '../../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function narratorPlanning(instance: Instance & { messages: Message[] }) {
  let updatedInstance = await updateInstanceStage(instance, InstanceStage.NARRATOR_PLANNING_START);

  const messages = convertInstanceToChatCompletionMessageParams(instance);

  const planningMessages = [
    ...messages,
    { content: '[Narrator Inner Monologue] To adjust the story going forward, I will ', role: MessageRole.assistant },
  ] as ChatCompletionMessageParam[];

  const planningStartTime = Date.now();
  const planningResponse = await openai.chat.completions.create({
    messages: planningMessages,
    model: 'gpt-4-turbo-preview',
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_narrator_internal_monologue_plan',
          description:
            'From the perspective of the narrator, create a one sentence plan on on how you will adjust the story going forward based on the player\'s last action and its corresponding dice roll. Your plan should be a single sentence that begins with "I will". Provide an indepth thought process. Do not repeat prior information. No newlines. An example of this would be "I will have the enemy attack the player with a sword, and if the player rolls a 15 or higher, the player will be able to dodge the attack."',
          parameters: {
            type: 'object',
            properties: {
              plan: {
                type: 'string',
              },
            },
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: {
        name: 'generate_narrator_internal_monologue_plan',
      },
    },
  });
  const planningEndTime = Date.now();

  if (!planningResponse.choices[0].message.tool_calls) {
    throw new Error('[generate_narrator_internal_monologue_plan] No function call found');
  }
  logNonStreamedOpenAIResponse(instance.userId, planningMessages, planningResponse, planningEndTime - planningStartTime);

  const planningArgs = JSON.parse(planningResponse.choices[0].message.tool_calls[0].function.arguments);

  updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: `[Narrator Inner Monologue] To adjust the story going forward, ${planningArgs.plan}`,
          name: 'narrator_internal_monologue_plan',
        },
      },
      history: {
        push: updatedInstance.stage,
      },
      stage: InstanceStage.NARRATOR_PLANNING_FINISH,
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

export async function resetNarratorPlanning(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.system && lastMessage.name === 'narrator_internal_monologue_plan') {
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
