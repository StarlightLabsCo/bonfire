import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { db } from '../../services/db';
import { sendToUser } from '../../src/connection';
import { rollDice } from '../../core/dice/roll';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { narratorReaction } from '../../core/narrator/reaction';
import { continueStory } from '../../core/narrator/continue';
import { createImage } from '../../core/images';
import { generateActionSuggestions } from '../../core/suggestions/actions';

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
      messages: {
        select: {
          role: true,
          content: true,
          name: true,
          functionCall: true,
        },
      },
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

  let messages = [...instance.messages, { role: 'user', content: message }] as ChatCompletionMessageParam[];

  // TODO: THIS is where i need to do context window stuff
  messages = await rollDice(instance.id, messages);
  messages = await narratorReaction(instance.id, messages);
  messages = await continueStory(ws.data.connectionId!, instance.id, messages);

  messages = await createImage(ws.data.connectionId!, instance.id, messages);
  messages = await generateActionSuggestions(ws.data.connectionId!, instance.id, messages);

  // Queue up - importance & embedding - these aren't needed immedately because this message will be in the context
  // TODO: Add to queue
}
