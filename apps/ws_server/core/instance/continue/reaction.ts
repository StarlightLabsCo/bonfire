import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { db } from '../../../services/db';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';
import { updateInstanceStage } from '../utils';
import { sendToInstanceSubscribers } from '../../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function narratorReaction(instance: Instance & { messages: Message[] }) {
  let updatedInstance = await updateInstanceStage(instance, InstanceStage.NARRATOR_REACTION_START);

  const messages = convertInstanceToChatCompletionMessageParams(instance);
  const reactionMessages = [
    ...messages,
    { content: '[Narrator Inner Monologue] As the narrator, I feel ', role: MessageRole.assistant },
  ] as ChatCompletionMessageParam[];

  const reactionStartTime = Date.now();
  const reactionResponse = await openai.chat.completions.create({
    messages: reactionMessages,
    model: 'gpt-4-1106-preview',
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_narrator_internal_monologue_reaction',
          description:
            'From the perspective of the narrator, create a one sentence reaction based on the last player action (and the corresponding dice roll) and its impact on the story beginning with the words "I feel" with a reasoning as well. Include the full sentence. Do not exactly copy prior information. Stick to new info. No newlines. An example of this would be "I feel suprised that the player was able to successfully roll a natural 20, and am excited to see the epic events that will unfold."',
          parameters: {
            type: 'object',
            properties: {
              reaction: {
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
        name: 'generate_narrator_internal_monologue_reaction',
      },
    },
  });
  const reactionEndTime = Date.now();

  if (!reactionResponse.choices[0].message.tool_calls) {
    throw new Error('[generate_narrator_internal_monologue_reaction] No function call found');
  }

  logNonStreamedOpenAIResponse(instance.userId, reactionMessages, reactionResponse, reactionEndTime - reactionStartTime);

  const reactionArgs = JSON.parse(reactionResponse.choices[0].message.tool_calls[0].function.arguments);

  updatedInstance = await db.instance.update({
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

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceStageChanged,
    data: {
      instanceId: instance.id,
      stage: updatedInstance.stage,
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
