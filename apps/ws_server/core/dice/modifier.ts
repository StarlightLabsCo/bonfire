import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { Instance, Message } from 'database';
import { convertInstanceToChatCompletionMessageParams } from '../../src/utils';

export async function generateModifier(instance: Instance & { messages: Message[] }) {
  const messages = convertInstanceToChatCompletionMessageParams(instance);

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    functions: [
      {
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
    ],
    function_call: {
      name: 'generate_action_dice_modifier',
    },
  });

  const endTime = Date.now();

  const args = response.choices[0].message.function_call?.arguments;
  if (!args) {
    throw new Error('No arguments found in response');
  }

  logNonStreamedOpenAIResponse(instance.userId, messages, response, endTime - startTime);

  const argsJSON = JSON.parse(args);

  return {
    modifier: argsJSON.action_modifier,
    reason: argsJSON.reason,
  };
}
