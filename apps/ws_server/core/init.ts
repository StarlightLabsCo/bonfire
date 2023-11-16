import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { db } from '../services/db';
import { MessageRole } from 'database';

export async function initStory(instanceId: string, description: string) {
  let initPrompt =
    "You are a master storyteller. You have a wit as sharp as a dagger, and a heart as pure as gold. Given the description below create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the listener (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and we should match pacing accordingly, expanding on important sections, but keeping the story progressing at all times. When it's appropriate you can even imitate characters in the story for dialogue sections. Incorporate a climax moment that represents the culmination of all the plot elements of the story.\n\n" +
      'The requested story is as follows: ' +
      description ?? 'Suprise me!';

  await db.message.create({
    data: {
      instance: {
        connect: {
          id: instanceId,
        },
      },
      content: initPrompt,
      role: MessageRole.system,
      name: 'system_prompt',
    },
  });

  return [
    {
      content: initPrompt,
      role: MessageRole.system,
      name: 'system_prompt',
    } as ChatCompletionMessageParam,
  ] as ChatCompletionMessageParam[];
}
