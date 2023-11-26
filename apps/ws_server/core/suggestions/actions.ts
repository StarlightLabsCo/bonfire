import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { db } from '../../services/db';
import { Instance, Message, MessageRole } from 'database';
import { sendToInstanceSubscribers } from '../../src/connection';
import { StarlightWebSocketResponseType } from 'websocket/types';

export async function generateActionSuggestions(instance: Instance & { messages: Message[] }) {
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'generate_action_suggestions',
        description:
          "List 1-3 optimal actions for players, described in up to 4 words, based on the story. Analyze how past events affect each action's potential success, without predicting outcomes. Assign a unique modifier (-10 to 10) to each action for a d20 roll, reflecting pre-established conditions. Explain the reasoning for each modifier before stating its value.",
        parameters: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              description: 'Suggested actions, no duplicates. [Min: 1, Max: 3]',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    description: 'A suggested action for the player to take. [Min: 1 word, Max: 4 words]',
                  },
                  modifier_reason: {
                    type: 'string',
                    description:
                      'The reasoning to determine the modifier for the action. Must not be based on the outcome. Should only be based on prior information. [Min: 1 word, Max: 20 words]',
                  },
                  modifier: {
                    type: 'number',
                    description:
                      'Modifier for the action. Must not be based on the outcome of the action. [Min: -10, Max: 10, 0 is neutral and most common]',
                  },
                },
              },
            },
          },
        },
      },
    ],
    function_call: {
      name: 'generate_action_suggestions',
    },
  });
  const endTime = Date.now();

  const args = response.choices[0].message.function_call?.arguments;
  if (!args) {
    throw new Error('No arguments found in response');
  }

  logNonStreamedOpenAIResponse(instance.userId, messages, response, endTime - startTime);

  const argsJSON = JSON.parse(args);

  const message = await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      role: 'function',
      content: JSON.stringify(argsJSON.actions),
      name: 'action_suggestions',
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId: instance.id,
      message,
    },
  });

  return [
    ...messages,
    { role: MessageRole.function, content: JSON.stringify(argsJSON.actions), name: 'action_suggestions' },
  ];
}
