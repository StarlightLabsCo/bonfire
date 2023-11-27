import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { db } from '../../services/db';
import { convertInstanceToChatCompletionMessageParams } from '../../src/utils';

export async function narratorReaction(instance: Instance & { messages: Message[] }) {
  // ---- Reacting to the player's action & diceroll ----
  const messages = convertInstanceToChatCompletionMessageParams(instance);
  const reactionMessages = [
    ...messages,
    { content: '[Narrator Inner Monologue] As the narrator, I feel ', role: MessageRole.assistant },
  ] as ChatCompletionMessageParam[];

  const reactionStartTime = Date.now();
  const reactionResponse = await openai.chat.completions.create({
    messages: reactionMessages,
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'generate_narrator_internal_monologue_reaction',
        description:
          'From the perspective of the narrator, create a one sentence reaction based on the last player action (and the corresponding dice roll) and its impact on the story beginning with the words "I feel" with a reasoning as well. Include the full sentence. Do not exactly copy prior information. Stick to new info. No newlines.',
        parameters: {
          type: 'object',
          properties: {
            reaction: {
              type: 'string',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'generate_narrator_internal_monologue_reaction',
    },
  });
  const reactionEndTime = Date.now();

  if (!reactionResponse.choices[0].message.function_call) {
    throw new Error('[generate_narrator_internal_monologue_reaction] No function call found');
  }

  logNonStreamedOpenAIResponse(
    instance.userId,
    reactionMessages,
    reactionResponse,
    reactionEndTime - reactionStartTime,
  );

  const reactionArgs = JSON.parse(reactionResponse.choices[0].message.function_call.arguments);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: `[Narrator Inner Monologue] As the narrator, I feel ${reactionArgs.reaction}`,
          name: 'narrator_internal_monologue_reaction',
        },
      },
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  // ---- Adjusting the story ----
  const planningMessages = [
    ...messages,
    {
      content: `[Narrator Inner Monologue] As the narrator, I feel ${reactionArgs.reaction}`,
      role: MessageRole.system,
      name: 'narrator_internal_monologue_reaction',
    },
    {
      content: '[Narrator Inner Monologue] To adjust the story going forward, I will ',
      role: MessageRole.assistant,
    },
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
    updatedInstance.userId,
    planningMessages,
    planningResponse,
    planningEndTime - planningStartTime,
  );

  const planningArgs = JSON.parse(planningResponse.choices[0].message.function_call.arguments);

  updatedInstance = await db.instance.update({
    where: {
      id: updatedInstance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: `[Narrator Inner Monologue] To adjust the story going forward, I will ${planningArgs.plan}`,
          name: 'narrator_internal_monologue_plan',
        },
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
