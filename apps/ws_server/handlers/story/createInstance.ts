import { ServerWebSocket } from 'bun';
import { InstanceStage, MessageRole } from 'database';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { WebSocketData } from '../../src';
import { db } from '../../services/db';
import { stepInstanceUntil } from '../../core/stateMachine';
import { subscribeUserToInstance } from '../../src/connection';

export async function createInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstance) {
    throw new Error('Invalid request type for createInstanceHandler');
  }

  let initPrompt =
    "You are a master storyteller. You have a wit as sharp as a dagger, and a heart as pure as gold. Given the description below create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the listener (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and we should match pacing accordingly, expanding on important sections, but keeping the story progressing at all times. When it's appropriate you can even imitate characters in the story for dialogue sections. Incorporate a climax moment that represents the culmination of all the plot elements of the story.\n\n" +
      'The requested story is as follows: ' +
      request.data.description ?? 'Suprise me!';

  let initMessage = {
    content: initPrompt,
    role: MessageRole.system,
    name: 'system_prompt',
  };

  // TODO: how to best handle error handling outside of the state machine?
  let instance = await db.instance.create({
    data: {
      user: {
        connect: {
          id: ws.data.webSocketToken?.userId!,
        },
      },
      description: request.data.description,
      messages: {
        create: initMessage,
      },
      stage: InstanceStage.INIT_STORY_FINISH,
    },
    include: {
      messages: true,
    },
  });

  subscribeUserToInstance(ws.data.webSocketToken?.userId!, instance.id);

  await stepInstanceUntil(instance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);
}
