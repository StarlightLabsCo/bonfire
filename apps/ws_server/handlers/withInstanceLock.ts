import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest, StarlightWebSocketResponseType } from 'websocket/types';
import { db } from '../services/db';
import { sendToInstanceSubscribers, sendToUser } from '../src/connection';

const LOCK_TIMEOUT = 60 * 1000 * 5; // 5 minutes

function isInstanceRequest(request: StarlightWebSocketRequest): request is StarlightWebSocketRequest & { data: { instanceId: string } } {
  return 'instanceId' in request.data;
}

export function withInstanceLock(
  handler: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => Promise<void>,
): (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => Promise<void> {
  return async function (ws, request) {
    if (!isInstanceRequest(request)) {
      throw new Error('Request is not an instance request');
    }

    const instanceId = request.data.instanceId;
    const instance = await db.instance.findUnique({ where: { id: instanceId } });

    if (!instance) {
      throw new Error('Instance not found');
    }

    if (instance.locked && instance.lockedAt && Date.now() - instance.lockedAt.valueOf() < LOCK_TIMEOUT) {
      throw new Error('Instance is currently being processed');
    }

    const lockedAt = new Date();

    await db.instance.update({ where: { id: instanceId }, data: { locked: true, lockedAt } });

    sendToInstanceSubscribers(instanceId, {
      type: StarlightWebSocketResponseType.instanceLockStatusChanged,
      data: {
        instanceId,
        locked: true,
        lockedAt,
      },
    });

    try {
      await handler(ws, request);
    } catch (error) {
      console.error('Error handling request: ', error);
      sendToUser(ws.data.webSocketToken!.userId, {
        type: StarlightWebSocketResponseType.error,
        data: {
          message: 'Error handling request. Please try again.',
        },
      });
    } finally {
      await db.instance.update({ where: { id: instanceId }, data: { locked: false, lockedAt: null } });

      sendToInstanceSubscribers(instanceId, {
        type: StarlightWebSocketResponseType.instanceLockStatusChanged,
        data: {
          instanceId,
          locked: false,
          lockedAt: null,
        },
      });
    }
  };
}
