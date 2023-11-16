import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis } from '../services/redis';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateResponse } from 'websocket/utils';

// This map maintains the most updated websocket for each user. Stored as a map of userId-connectionId to websocket
const userIdToWebSocket: Record<string, ServerWebSocket<WebSocketData>> = {};

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  const userId = ws.data.webSocketToken!.userId!;

  const existingWebsocket = userIdToWebSocket[userId];
  if (existingWebsocket) {
    console.log('Existing websocket found, closing it'); // TODO: add a message to the user saying they've been disconnected
    existingWebsocket.close();
  }

  userIdToWebSocket[userId] = ws;

  // Send any queued messages
  const queuedMessages = await redis.lrange(ws.data.connectionId!, 0, -1);
  for (const message of queuedMessages) {
    const validated = validateResponse(message);
    if (!validated) return;

    ws.send(message);
  }

  // Delete all user keys
  const keys = await redis.keys(`${userId}-*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

export function sendToUser(userId: string, data: StarlightWebSocketResponse) {
  console.log('Sending to user', userId, StarlightWebSocketResponseType[data.type]);
  const websocket = userIdToWebSocket[userId];

  if (typeof websocket === 'undefined') {
    console.log(`No websocket found for user ${userId}`);
    return;
  }

  if (websocket.readyState !== 1) {
    console.log('Websocket found but not open, queueing message');
    redis.rpush(websocket.data.connectionId!, JSON.stringify(data));
    return;
  }

  const status = websocket.send(JSON.stringify(data));
  if (status === 0) {
    console.log('Message failed to send, queueing message');
    redis.rpush(websocket.data.connectionId!, JSON.stringify(data));
  }
}
