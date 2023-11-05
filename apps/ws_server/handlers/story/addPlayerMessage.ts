import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { db } from '../../services/db';
import { sendToUser } from '../../src/connection';

export async function addPlayerMessageHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.addPlayerMessage) {
    throw new Error('Invalid request type for addPlayerMessageHandler');
  }

  const { instanceId, message } = request.data;

  // Validation
  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
      userId: ws.data.webSocketToken!.userId,
    },
    include: {
      messages: true,
    },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  // TODO: add a step to check that the instance state is valid and it can properly accept a user action

  // Add message
  const addedMessage = await db.message.create({
    data: {
      instanceId,
      role: 'user',
      content: message,
      accessedAt: new Date(),
    },
  });

  sendToUser(ws.data.connectionId!, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId,
      message: addedMessage,
    },
  });

  let messages = [...instance.messages, addedMessage];

  // TODO: dice roll - with modifiers
  // TODO: narrator internal monologue - reaction
  // TODO: narrator internal monologue - planning
  // TODO: narration - next story beat

  // TODO: THIS is where i need to do context window stuff

  // TODO: generate image
  // TODO: action suggestions

  // Queue up - importance & embedding - these aren't needed immedately because this message will be in the context
  // TODO: Add to queue

  // Trigger next step in the story
  // TODO: trigger story step
}
