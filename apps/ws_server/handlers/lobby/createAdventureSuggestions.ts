import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { db } from '../../services/db';
import { generateAdventureSuggestions } from '../../core/lobby/adventures';

export async function createAdventureSuggestionsHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.createAdventureSuggestions) {
    throw new Error('Invalid request type for createAdventureSuggestionsHandler');
  }

  const userId = ws.data.webSocketToken?.userId!;

  const instances = await db.instance.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  await generateAdventureSuggestions(userId, instances);
}
