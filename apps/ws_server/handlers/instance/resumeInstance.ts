import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { sendToWebsocket } from '../../src/connection';
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
      userId: ws.data.webSocketToken!.userId,
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
    sendToWebsocket(ws.data.connectionId!, {
      type: StarlightWebSocketResponseType.error,
      data: {
        message: `Instance ${instanceId} not found`,
      },
    });
    throw new Error('No instance found');
  }

  await stepInstanceUntil(instance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);
}
