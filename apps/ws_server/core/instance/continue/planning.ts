import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';
import { db } from '../../../services/db';

export async function narratorPlanning(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  const planningMessages = [
    ...messages,
    { content: '[Narrator Inner Monologue] To adjust the story going forward, I will ', role: MessageRole.assistant },
  ] as ChatCompletionMessageParam[];

  const planningStartTime = Date.now();
  const planningResponse = await openai.chat.completions.create({
    messages: planningMessages,
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'generate_narrator_internal_monologue_plan',
        description:
          'One sentence describing how you, the narrator, will adjust the story based on the player\'s last action and its corresponding dice roll. (The impact of an action that recieves an average dice roll should still have a meaningful impact on the immediate events in the story.) Your plan should be a single sentence that begins with "I will". Provide an indepth thought process. Do not repeat prior information. No newlines.',
        parameters: {
          type: 'object',
          properties: {
            plan: {
              type: 'string',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'generate_narrator_internal_monologue_plan',
    },
  });
  const planningEndTime = Date.now();

  if (!planningResponse.choices[0].message.function_call) {
    throw new Error('[generate_narrator_internal_monologue_plan] No function call found');
  }

  logNonStreamedOpenAIResponse(
    instance.userId,
    planningMessages,
    planningResponse,
    planningEndTime - planningStartTime,
  );

  const planningArgs = JSON.parse(planningResponse.choices[0].message.function_call.arguments);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: `[Narrator Inner Monologue] To adjust the story going forward, I will ${planningArgs.plan}`,
          name: 'narrator_internal_monologue_plan',
        },
      },
      history: {
        push: instance.stage,
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
      stage: InstanceStage.NARRATOR_REACTION_FINISH,
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
