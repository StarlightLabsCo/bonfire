import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from '../../services/db';
import { openai } from '../../services/openai';
import { MessageRole } from 'database';

export async function createOutline(instanceId: string, messages: ChatCompletionMessageParam[]) {
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4',
    functions: [
      {
        name: 'plan_story',
        description:
          'Imagine a detailed plan for the story. Describe, in detail, the overarching story, the main characters, twists, the main goal, as well as smaller scale beats and memorable moments. This will only be referenced by yourself, the storyteller, and should not be shared with the players. Be specific in your plan, naming characters, locations, events in depth while making sure to include the players in the story. Always think a few steps ahead to make the story feel alive. No newlines.',
        parameters: {
          type: 'object',
          properties: {
            plan: {
              type: 'string',
              description: 'No newlines.',
            },
          },
        },
      },
    ],
    function_call: {
      name: 'plan_story',
    },
  });

  if (!response.choices[0].message.function_call) {
    throw new Error('No choices returned from GPT-4');
  }

  const args = JSON.parse(response.choices[0].message.function_call.arguments.replace('\\n', ''));

  await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      role: MessageRole.system,
      content: args.plan,
      name: 'story_outline',
    },
  });

  return [
    ...messages,
    { role: MessageRole.system, content: args.plan, name: 'story_outline' },
  ] as ChatCompletionMessageParam[];
}
