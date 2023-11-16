import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from '../../services/db';
import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { MessageRole } from 'database';

export async function createOutline(userId: string, instanceId: string, messages: ChatCompletionMessageParam[]) {
  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-1106-preview',
    functions: [
      {
        name: 'plan_story',
        description:
          'Craft a detailed plan for the story. Describe, fully, the overarching story, the main characters, twists, and the main goal. This outline should also include smaller scale beats and memorable moments, but should never allow the story to get so cluttered that it is no longer followable. The consequences of each plot point should have bearing on every other plot point and on the story as a whole, thereby weaving an interconnected tapestry of events. Be specific in your plan, naming characters, locations, events in depth while making sure to include the listener in the story. Always think a few steps ahead to make the story feel alive. This outline will only be referenced by yourself, the storyteller, and should not be shared with the listener.',
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
      name: 'plan_story',
    },
  });
  const endTime = Date.now();

  if (!response.choices[0].message.function_call) {
    throw new Error('No choices returned from GPT-4');
  }

  logNonStreamedOpenAIResponse(userId, messages, response, endTime - startTime);

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
