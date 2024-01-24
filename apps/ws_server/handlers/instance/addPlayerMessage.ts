import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { db } from '../../services/db';
import { InstanceStage, MessageRole } from 'database';
import { sendToInstanceSubscribers } from '../../src/connection';
import { stepInstanceUntil } from '../../core/instance/stateMachine';

export async function addPlayerMessageHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.addPlayerMessage) {
    throw new Error('Invalid request type for addPlayerMessageHandler');
  }

  const { instanceId, message } = request.data;

  let instance = await db.instance.findUnique({
    where: {
      id: instanceId,
      stage: InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      players: true,
    },
  });

  if (!instance) {
    throw new Error('Instance not found'); // either the instance doesn't exist, or the user doesn't own it, or it's not in the right stage
  }

  if (!(instance.userId === ws.data.webSocketToken?.userId) && !instance.players.find((p) => p.id === ws.data.webSocketToken?.userId)) {
    throw new Error('User is not a player in this instance');
  }

  let updatedInstance = await db.instance.update({
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
      history: {
        push: instance.stage,
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

  sendToInstanceSubscribers(updatedInstance.id, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId,
      message: updatedInstance.messages[updatedInstance.messages.length - 1],
    },
  });

  await stepInstanceUntil(updatedInstance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);
}
