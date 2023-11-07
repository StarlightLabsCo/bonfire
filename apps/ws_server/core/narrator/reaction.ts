import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { openai } from '../../services/openai';
import { MessageRole } from 'database';
import { db } from '../../services/db';
import { embedMessage } from '../context/embedding';

export async function narratorReaction(instanceId: string, messages: ChatCompletionMessageParam[]) {
  // ---- Reacting to the player's action & diceroll ----
  const reactionResponse = await openai.chat.completions.create({
    messages: [
      ...messages,
      { content: '[Narrator Inner Monologue] As the narrator, I feel ', role: MessageRole.assistant },
    ],
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'generate_narrator_internal_monologue_reaction',
        description:
          'From the perspective of the narrator, create a one sentence reaction based on the last player action (and the correspodning dice roll) and its impact on the story beginning with the words "I feel" with a reasoning as well. Include the full sentence. Do not exactly copy prior information. Stick to new info. No newlines.',
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

  if (!reactionResponse.choices[0].message.function_call) {
    throw new Error('[generate_narrator_internal_monologue_reaction] No function call found');
  }

  const reactionArgs = JSON.parse(reactionResponse.choices[0].message.function_call.arguments);

  const reactionMessage = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: `[Narrator Inner Monologue] As the narrator, I feel ${reactionArgs.reaction}`,
      role: MessageRole.system,
      name: 'narrator_internal_monologue_reaction',
    },
  });

  embedMessage(reactionMessage.id, `[Narrator Inner Monologue] As the narrator, I feel ${reactionArgs.reaction}`);

  // ---- Adjusting the story ----
  const planningResponse = await openai.chat.completions.create({
    messages: [
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
    ],
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

  if (!planningResponse.choices[0].message.function_call) {
    throw new Error('[generate_narrator_internal_monologue_plan] No function call found');
  }

  const planningArgs = JSON.parse(planningResponse.choices[0].message.function_call.arguments);

  const planningMessage = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: `[Narrator Inner Monologue] To adjust the story going forward, I will ${planningArgs.plan}`,
      role: MessageRole.system,
    },
  });

  embedMessage(
    planningMessage.id,
    `[Narrator Inner Monologue] To adjust the story going forward, I will ${planningArgs.plan}`,
  );

  return [
    ...messages,
    {
      content: `[Narrator Inner Monologue] As the narrator, I feel ${reactionArgs.reaction}`,
      role: MessageRole.system,
      name: 'narrator_internal_monologue_reaction',
    },
    {
      content: `[Narrator Inner Monologue] To adjust the story going forward, I will ${planningArgs.plan}`,
      role: MessageRole.system,
      name: 'narrator_internal_monologue_plan',
    },
  ];
}
