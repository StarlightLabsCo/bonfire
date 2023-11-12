import { ActionSuggestion } from 'websocket/types';
import { db } from '../../services/db';
import { generateModifier } from './modifier';
import { MessageRole } from 'database';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function rollDice(userId: string, instanceId: string, messages: ChatCompletionMessageParam[]) {
  let userAction = messages[messages.length - 1].content; // TODO: add validation here

  let modifier = null;
  let reason = null;

  // see if the message matches any of the action suggestions (and precomputed modifiers)
  let suggestions = messages[messages.length - 2];
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
    const result = await generateModifier(userId, messages);
    modifier = result.modifier;
    reason = result.reason;
  }

  // Roll
  const roll = Math.floor(Math.random() * 20) + 1;

  let modifiedRoll = roll + (modifier || 0);
  modifiedRoll = Math.max(0, modifiedRoll);
  modifiedRoll = Math.min(20, modifiedRoll);

  await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: `[Dice Roll] Rolling a d20... The player rolled a: ${modifiedRoll} [${roll} + ${modifier}] - ${reason}`,
      role: MessageRole.system,
    },
  });

  return [
    ...messages,
    {
      role: MessageRole.system,
      content: `[Dice Roll] Rolling a d20... The player rolled a: ${modifiedRoll} [${roll} + ${modifier}] - ${reason}`,
    },
  ];
}
