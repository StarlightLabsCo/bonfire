import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis } from '../services/redis';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateResponse } from 'websocket/utils';

// This map maintains the most updated websocket for each user. Stored as a map of userId-connectionId to websocket
const connectionIdToWebSocket: {
  [key: string]: ServerWebSocket<WebSocketData> | null;
} = {};

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  const userId = ws.data.webSocketToken!.userId!;
  const key = ws.data.connectionId!;

  // Add (or update) the websocket to the user
  connectionIdToWebSocket[key] = ws;

  // Clear out any old message queues from the user on redis - user can only have 1 message queue at a time
  const oldKeys = await redis.keys(`${userId}-*`);
  const keysToDelete = oldKeys.filter((connectionKey) => connectionKey !== key);
  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete);
  }

  // Send any queued messages
  const queuedMessages = await redis.lrange(key, 0, -1);
  for (const message of queuedMessages) {
    const validated = validateResponse(message);
    if (!validated) return;

    ws.send(message);
  }

  // Delete the queue after sending
  await redis.del(key);

  // TODO: reroute any old conenctionid messages to the new connectionid
}

export function sendToUser(connectionId: string, data: StarlightWebSocketResponse) {
  console.log('Sending to user', connectionId, StarlightWebSocketResponseType[data.type]);
  const websocket = connectionIdToWebSocket[connectionId];

  if (!websocket || websocket.readyState !== 1) {
    console.log('Websocket not found or not open, queueing message');
    redis.rpush(connectionId, JSON.stringify(data));
    return;
  }

  const status = websocket.send(JSON.stringify(data));
  if (status === 0) {
    console.log('Message failed to send, queueing message');
    redis.rpush(connectionId, JSON.stringify(data));
  }
}

export function clearWebsocketFromConnection(connectionId: string) {
  delete connectionIdToWebSocket[connectionId];
}
