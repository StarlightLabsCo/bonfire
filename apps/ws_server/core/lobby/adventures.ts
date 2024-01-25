import { logNonStreamedOpenAIResponse, openai } from '../../services/openai';
import { StarlightWebSocketResponseType } from 'websocket/types';
import { sendToWebsocket } from '../../src/connection';
import { Instance } from 'database';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function generateAdventureSuggestions(userId: string, connectionId: string, instances: Instance[]) {
  const messages = [
    {
      role: 'system',
      content:
        'You are an experienced storyteller, with a sharp wit, a heart of gold and a love for stories. Your goal is to bring people on new experiences.' +
        (instances.length > 0
          ? `In the past the listener has requested these stories, but don't format the phraseology of the titles based on these: ${instances
              .map((instance) => '- ' + instance.description + '\n')
              .join('')}.\n`
          : '') +
        '  Come up with three, entirely new, short, curiosity-inspiring titles, devoid of alliteration, for adventures the listener may enjoy. The title should be completely unrelated to the previous adventures, in different genres too! I repeat, no alliteration!!! Prioritize readability and story potential over literary flare. Use verbs for the story premise, and make sure the verbs are something that a person could do. Avoid abstract words & concepts. Adjectives should be meaningful to the nouns they modify. Verbs should be meaningful to their corresponding direct objects. Be creative! Be clear! Be memorable!',
    },
  ] as ChatCompletionMessageParam[];

  const startTime = Date.now();
  const response = await openai.chat.completions.create({
    messages: messages,
    model: 'gpt-4-turbo-preview',
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_new_adventure_suggestions',
          description:
            'Suggestions should be entirely unique (max 20 characters). Each title should be completely unrelated to each other. Be vibrant, and creative! Use verbs to describe actions! e.g. No colons or semicolons. [3 suggestions max]',
          parameters: {
            type: 'object',
            properties: {
              new_adventure_suggestions: {
                type: 'array',
                items: {
                  type: 'string',
                  description: 'A suggested title for an adventure.',
                },
              },
            },
          },
        },
      },
    ],
    tool_choice: {
      type: 'function',
      function: {
        name: 'generate_new_adventure_suggestions',
      },
    },
  });
  const endTime = Date.now();

  if (!response.choices[0].message.tool_calls) {
    throw new Error('No adventure suggestions generated by OpenAI');
  }

  logNonStreamedOpenAIResponse(userId, messages, response, endTime - startTime);

  const args = response.choices[0].message.tool_calls[0].function.arguments;
  const argsJSON = JSON.parse(args);

  sendToWebsocket(connectionId, {
    type: StarlightWebSocketResponseType.adventureSuggestionsCreated,
    data: {
      suggestions: argsJSON.new_adventure_suggestions,
    },
  });
}
