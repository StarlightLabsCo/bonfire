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

export async function createInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstance) {
    throw new Error('Invalid request type for createInstanceHandler');
  }

  const userId = ws.data.webSocketToken?.userId!;

  const instance = await db.instance.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      description: request.data.description,
    },
  });

  // story generation
  let messages = await initStory(instance.id, request.data.description);
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
