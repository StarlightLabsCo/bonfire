import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { db } from '../../services/db';
import { InstanceStage, MessageRole } from 'database';
import { sendToInstanceSubscribers } from '../../src/connection';
import { stepInstanceUntil } from '../../core/stateMachine';

export async function addPlayerMessageHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.addPlayerMessage) {
    throw new Error('Invalid request type for addPlayerMessageHandler');
  }

  const { instanceId, message } = request.data;

  // Validation
  let instance = await db.instance.findUnique({
    where: {
      id: instanceId,
      userId: ws.data.webSocketToken?.userId!,
      stage: InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH,
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
    throw new Error('Instance not found'); // either the instance doesn't exist, or the user doesn't own it, or it's not in the right stage
  }

  instance = await db.instance.update({
    where: {
      id: instanceId,
    },
    data: {
      messages: {
        create: {
          role: MessageRole.user,
          content: message,
        },
      },
      stage: InstanceStage.ADD_PLAYER_MESSAGE_FINISH,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId,
      message: instance.messages[instance.messages.length - 1],
    },
  });

  await stepInstanceUntil(instance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);
}
