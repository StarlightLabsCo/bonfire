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

  const userId = ws.data.webSocketToken?.userId!;

  const { instanceId, message } = request.data;

  // Validation
  const instance = await db.instance.findUnique({
    where: {
      id: instanceId,
      userId: userId,
    },
    include: {
      messages: {
        select: {
          role: true,
          content: true,
          name: true,
          function_call: true,
        },
        orderBy: {
          createdAt: 'asc',
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
    },
  });

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.messageAdded,
    data: {
      instanceId,
      message: addedMessage,
    },
  });

  let messages = [...instance.messages, { role: 'user', content: message }] as ChatCompletionMessageParam[];

  // filter out any null-valued keys
  messages = messages.map((message) => {
    return Object.fromEntries(Object.entries(message).filter(([_, v]) => v != null));
  }) as ChatCompletionMessageParam[];

  messages = await rollDice(userId, instance.id, messages);
  messages = await narratorReaction(userId, instance.id, messages);
  messages = await continueStory(userId, instance.id, messages);
  messages = await createImage(userId, instance.id, messages);
  messages = await generateActionSuggestions(userId, instance.id, messages);
}
