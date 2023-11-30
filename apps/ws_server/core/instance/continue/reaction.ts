import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { db } from '../../../services/db';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';

export async function narratorReaction(instance: Instance & { messages: Message[] }) {
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

export async function resetNarratorReaction(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.system && lastMessage.name === 'narrator_internal_monologue_reaction') {
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
