import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { subscribeUserToInstance } from '../../src/connection';
import { db } from '../../services/db';

export async function subscribeToInstanceHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.subscribeToInstance) {
    throw new Error('Invalid request type for subscribeToInstanceHandler');
  }

  const instanceId = request.data.instanceId;

  if (!instanceId) {
    throw new Error('No instanceId provided');
  }

  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
    },
  });

  if (!instance) {
    throw new Error('No instance found');
  }

  if (instance.userId !== ws.data.webSocketToken!.userId && !instance.public) {
    throw new Error('User is not authorized to subscribe to this instance');
  }

  subscribeUserToInstance(ws.data.webSocketToken!.userId, request.data.instanceId);
}
