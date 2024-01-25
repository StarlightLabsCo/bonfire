import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest } from 'websocket/types';
import { db } from '../services/db';

function isInstanceRequest(request: StarlightWebSocketRequest): request is StarlightWebSocketRequest & { data: { instanceId: string } } {
  return 'instanceId' in request.data;
}

export function isInstancePlayer(
  handler: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => Promise<void>,
): (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => Promise<void> {
  return async function (ws, request) {
    if (!isInstanceRequest(request)) {
      throw new Error('Request is not an instance request');
    }

    const instanceId = request.data.instanceId;
    const instance = await db.instance.findUnique({
      where: { id: instanceId },
      include: { players: true },
    });

    if (!instance) {
      throw new Error('Instance not found');
    }

    const userId = ws.data.webSocketToken?.userId;
    if (!(instance.userId === userId) && !instance.players.find((p) => p.id === userId)) {
      throw new Error('User is not a player in this instance');
    }

    await handler(ws, request);
  };
}
