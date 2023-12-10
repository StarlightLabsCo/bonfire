import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToUser, subscribeUserToInstance } from '../../src/connection';
import { db } from '../../services/db';

export async function subscribeToInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.subscribeToInstance) {
    throw new Error('Invalid request type for subscribeToInstanceHandler');
  }

  const instanceId = request.data.instanceId;

  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
    },
  });

  if (!instance) {
    sendToUser(ws.data.webSocketToken!.userId, {
      type: StarlightWebSocketResponseType.error,
      data: {
        message: `Instance ${instanceId} not found`,
      },
    });
    throw new Error('No instance found');
  }

  if (instance.userId !== ws.data.webSocketToken!.userId && !instance.public) {
    sendToUser(ws.data.webSocketToken!.userId, {
      type: StarlightWebSocketResponseType.error,
      data: {
        message: `Instance ${instanceId} not found`, // Don't leak that the instance exists
      },
    });
    throw new Error(`User ${ws.data.webSocketToken!.userId} is not authorized to subscribe from this instance ${instanceId}`);
  }

  subscribeUserToInstance(ws.data.webSocketToken!.userId, request.data.instanceId);
}
