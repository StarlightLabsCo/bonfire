import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis } from '../services/redis';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateResponse } from 'websocket/utils';

// This map maintains the most updated websocket for each user. Stored as a map of userId-connectionId to websocket
const userIdToWebSocket: Record<string, ServerWebSocket<WebSocketData>> = {};
const instanceSubscriptions: Record<string, string[]> = {};

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  const userId = ws.data.webSocketToken!.userId!;

  const existingWebsocket = userIdToWebSocket[userId];
  if (existingWebsocket) {
    console.log('Existing websocket found, closing it');
    sendToUser(userId, {
      type: StarlightWebSocketResponseType.anotherOpenTab,
      data: {},
    });
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

// *** User ***
export function sendToUser(userId: string, data: StarlightWebSocketResponse) {
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

// *** Instance Publish / Subscribe ***
export function subscribeUserToInstance(userId: string, instanceId: string) {
  if (!instanceSubscriptions[instanceId]) {
    instanceSubscriptions[instanceId] = [];
  }
  instanceSubscriptions[instanceId].push(userId);
}

export function unsubscribeUserFromInstance(userId: string, instanceId: string) {
  const subscribers = instanceSubscriptions[instanceId];
  if (subscribers) {
    instanceSubscriptions[instanceId] = subscribers.filter((subscriber) => subscriber !== userId);
  }
}

export function sendToInstanceSubscribers(instanceId: string, data: StarlightWebSocketResponse) {
  const subscribers = instanceSubscriptions[instanceId];
  if (subscribers) {
    subscribers.forEach((userId) => {
      sendToUser(userId, data);
    });
  }
}
