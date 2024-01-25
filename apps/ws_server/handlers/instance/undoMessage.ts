import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { db } from '../../services/db';
import { InstanceStage } from 'database';
import { sendToInstanceSubscribers, sendToWebsocket } from '../../src/connection';

export async function undoMessageHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.undoMessage) {
    throw new Error('Invalid request type for undoMessageHandler');
  }

  const instanceId = request.data.instanceId;

  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!instance) {
    throw new Error('No instance found');
  }

  // Find the most recent ADD_PLAYER_MESSAGE_FINISH message
  const lastPlayerMessageIndex = instance.messages.findIndex((message) => message.role === 'user');

  if (lastPlayerMessageIndex === -1) {
    throw new Error('No player message found');
  }

  // Delete this message and all messages that came after it
  const messageIdsToDelete = instance.messages.slice(0, lastPlayerMessageIndex + 1).map((message) => message.id);

  for (const messageId of messageIdsToDelete) {
    await db.message.delete({
      where: {
        id: messageId,
      },
    });

    sendToInstanceSubscribers(instance.id, {
      type: StarlightWebSocketResponseType.messageDeleted,
      data: {
        instanceId: instance.id,
        messageId: messageId,
      },
    });
  }

  // Find the stage before ADD_PLAYER_MESSAGE_FINISH in the history
  const lastPlayerActionIndex = instance.history.lastIndexOf(InstanceStage.ADD_PLAYER_MESSAGE_FINISH);

  if (lastPlayerActionIndex === -1 || lastPlayerActionIndex === 0) {
    throw new Error('No previous player action found');
  }

  const stageBeforePlayerAction = instance.history[lastPlayerActionIndex - 1];
  const updatedHistory = instance.history.slice(0, lastPlayerActionIndex);

  await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      stage: stageBeforePlayerAction,
      history: updatedHistory,
    },
  });
}
