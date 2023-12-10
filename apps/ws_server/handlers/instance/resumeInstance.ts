import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToUser } from '../../src/connection';
import { db } from '../../services/db';
import { stepInstanceUntil } from '../../core/instance/stateMachine';
import { InstanceStage } from 'database';

export async function resumeInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.resumeInstance) {
    throw new Error('Invalid request type for resumeInstanceHandler');
  }

  const instanceId = request.data.instanceId;

  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
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
    throw new Error(`User ${ws.data.webSocketToken!.userId} is not authorized to resume this instance ${instanceId}`);
  }

  await stepInstanceUntil(instance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);
}
