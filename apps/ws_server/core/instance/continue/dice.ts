import { ActionSuggestion } from 'websocket/types';
import { db } from '../../../services/db';
import { Instance, InstanceStage, Message, MessageRole } from 'database';
import { convertInstanceToChatCompletionMessageParams } from '../../../src/utils';
import { logNonStreamedOpenAIResponse, openai } from '../../../services/openai';

export async function rollDice(instance: Instance & { messages: Message[] }) {
  let userAction = instance.messages[instance.messages.length - 1].content; // TODO: add validation here

  let modifier = null;
  let reason = null;

  // see if the message matches any of the action suggestions (and precomputed modifiers)
  let suggestions = instance.messages[instance.messages.length - 2];
  if (suggestions.role === 'function' && suggestions.name === 'action_suggestions' && suggestions.content) {
    const suggestionsArray = JSON.parse(suggestions.content) as ActionSuggestion[];
    const action = suggestionsArray.find((suggestion: ActionSuggestion) => suggestion.action === userAction);
    if (action) {
      modifier = action.modifier;
      reason = action.modifier_reason;
    }
  }

  // if no modifier, generate one
  if (!modifier) {
    const result = await generateModifier(instance);
    modifier = result.modifier;
    reason = result.reason;
  }

  // Roll
  const roll = Math.floor(Math.random() * 20) + 1;

  let modifiedRoll = roll + (modifier || 0);
  modifiedRoll = Math.max(0, modifiedRoll);
  modifiedRoll = Math.min(20, modifiedRoll);

  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.system,
          content: `[Dice Roll] Rolling a d20... The player rolled a: ${modifiedRoll} [${roll} + ${modifier}] - ${reason}`,
          name: 'roll_dice',
        },
      },
      history: {
        push: instance.stage,
      },
      stage: InstanceStage.ROLL_DICE_FINISH,
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

export async function generateModifier(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_action_dice_modifier',
          description:
            "Based on the story BEFORE THE MOST RECENT ACTION TOOK PLACE, generate a modifier for the narrator's dice roll for that specific action. This modifier should be representative of the confluence of all relevant factors within the story prior to the most recent action. This modifier should not be based on the outcome of said action or it's effects on the world. It must SOLELY be based on effects and actions before it took place. 0 is neutral, and should be the most common. Non-zero numbers are proportionately common to their proximity to zero. [Min: -15, Max: 15]",
          parameters: {
            type: 'object',
            properties: {
              action_modifier: {
                type: 'number',
                description:
                  'Modifier for the action. Must not be based on the outcome. Should only be based on prior information. [Min: -15, Max: 15]',
              },
              reason: {
                type: 'string',
                description: 'Reason for the modifier.',
              },
            },
          },
        },
      },
    ],
    function_call: {
      name: 'generate_action_dice_modifier',
    },
  });

  const endTime = Date.now();

  if (!response.choices[0].message.tool_calls) {
    throw new Error('[generate_action_dice_modifier] No function call found');
  }

  const args = response.choices[0].message.tool_calls[0].function.arguments;
  if (!args) {
    throw new Error('No args found in response');
  }

  logNonStreamedOpenAIResponse(instance.userId, messages, response, endTime - startTime);

  const argsJSON = JSON.parse(args);

  return {
    modifier: argsJSON.action_modifier,
    reason: argsJSON.reason,
  };
}

export async function resetRollDice(instance: Instance & { messages: Message[] }) {
  const lastMessage = instance.messages[instance.messages.length - 1];
  if (lastMessage.role === MessageRole.system && lastMessage.name === 'roll_dice') {
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
