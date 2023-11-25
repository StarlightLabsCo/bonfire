import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { db } from '../../services/db';
import { sendToUser } from '../../src/connection';

// Story generation
import { initStory } from '../../core/init';
import { createOutline } from '../../core/planning/outline';
import { introduceStory } from '../../core/narrator/introduction';
import { createImage } from '../../core/images';
import { generateActionSuggestions } from '../../core/suggestions/actions';
import { InstanceStage, MessageRole } from 'database';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function createInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstance) {
    throw new Error('Invalid request type for createInstanceHandler');
  }

  const userId = ws.data.webSocketToken?.userId!;

  // init instance
  let initPrompt =
    "You are a master storyteller. You have a wit as sharp as a dagger, and a heart as pure as gold. Given the description below create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the listener (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and we should match pacing accordingly, expanding on important sections, but keeping the story progressing at all times. When it's appropriate you can even imitate characters in the story for dialogue sections. Incorporate a climax moment that represents the culmination of all the plot elements of the story.\n\n" +
      'The requested story is as follows: ' +
      request.data.description ?? 'Suprise me!';

  let initMessage = {
    content: initPrompt,
    role: MessageRole.system,
    name: 'system_prompt',
  };

  const instance = await db.instance.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      description: request.data.description,
      messages: {
        create: initMessage,
      },
      stage: InstanceStage.INIT_STORY_FINISH,
    },
  });

  // TODO: now go through and run it through the state machine, passing messages as needed
  // TODO: would need to figure out how to let the systme know which steps it should complete and which it should stop at
  // TODO: oh shit, maybe you can give it a desired end state and say, loop until you get to this end state or error
  // TODO: so like stepUntil(instance.id, InstaceStage.GENERATE_ACTIONS_SUGGESTION_FINISH)

  // story generation
  let messages = [initMessage as ChatCompletionMessageParam];

  messages = await createOutline(userId, instance.id, messages);

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.instanceCreated,
    data: {
      instanceId: instance.id,
    },
  });

  messages = await introduceStory(userId, instance.id, messages);
  messages = await createImage(userId, instance.id, messages);
  messages = await generateActionSuggestions(userId, instance.id, messages);
}
