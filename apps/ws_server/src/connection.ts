import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis, redisSubscriber } from '../services/redis';
import { InterReplicaMessage, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateInterReplicaMessage, validateResponse } from 'websocket/utils';
import { db } from '../services/db';

// This map maintains the most updated websocket for each user. Stored as a map of userId-connectionId to websocket
export const userIdToWebSocket: Record<string, ServerWebSocket<WebSocketData>> = {};

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  const userId = ws.data.webSocketToken!.userId!;

  const existingWebsocket = userIdToWebSocket[userId];
  if (existingWebsocket) {
    existingWebsocket.send(JSON.stringify({ type: StarlightWebSocketResponseType.anotherOpenTab, data: {} }));
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
export function sendToUser(userId: string, data: StarlightWebSocketResponse, broadcastIfNoWebsocket = true) {
  const websocket = userIdToWebSocket[userId];

  if (typeof websocket === 'undefined') {
    console.log(`No websocket found on this replica for this user ${userId}`);

    if (broadcastIfNoWebsocket) {
      // If we don't have the websocket on this replica, publish the message to redis for other replicas to try
      console.log(`Could not find websocket for user (${userId}). Publishing message to redis for other replicas to try`);

      redis.publish(
        'inter-replica-messages',
        JSON.stringify({
          userId,
          data,
        } as InterReplicaMessage),
      );
    }

    return;
  }

  if (websocket.readyState !== 1) {
    console.log(`Websocket for user ${userId} is not open`);
    return;
  }

  const status = websocket.send(JSON.stringify(data));
  if (status === 0) {
    console.log('Message failed to send, queueing message');
    redis.rpush(websocket.data.connectionId!, JSON.stringify(data));
  }
}

// ** Forwarded User Message (from another replica) **
redisSubscriber.on('message', (channel, message) => {
  const validatedMessage = validateInterReplicaMessage(message);
  if (!validatedMessage) return;

  console.log(`Received message from another replica for user ${validatedMessage.userId}, attempting to send`);
  const { userId, data } = validatedMessage;

  sendToUser(userId, data, false);
});

// *** Instance Publish / Subscribe ***
export async function subscribeUserToInstance(userId: string, instanceId: string) {
  await redis.sadd(`instanceSubscriptions:${instanceId}`, userId);

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.instanceSubscriptionStatus,
    data: {
      instanceId,
      subscribed: true,
    },
  });

  updateInstanceConnectedUsersStatus(instanceId);
}

export async function unsubscribeUserFromInstance(userId: string, instanceId: string) {
  await redis.srem(`instanceSubscriptions:${instanceId}`, userId);

  sendToUser(userId, {
    type: StarlightWebSocketResponseType.instanceSubscriptionStatus,
    data: {
      instanceId,
      subscribed: false,
    },
  });

  updateInstanceConnectedUsersStatus(instanceId);
}

async function updateInstanceConnectedUsersStatus(instanceId: string) {
  const subscribedIds = await redis.smembers(`instanceSubscriptions:${instanceId}`);
  if (!subscribedIds || subscribedIds.length === 0) return;

  const connectedUsers = await db.user.findMany({
    where: {
      id: {
        in: subscribedIds,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  sendToInstanceSubscribers(instanceId, {
    type: StarlightWebSocketResponseType.instanceConnectedUsersStatus,
    data: {
      instanceId,
      connectedUsers,
    },
  });
}

export async function sendToInstanceSubscribers(instanceId: string, data: StarlightWebSocketResponse) {
  const subscribers = await redis.smembers(`instanceSubscriptions:${instanceId}`);
  if (subscribers) {
    subscribers.forEach((userId) => {
      sendToUser(userId, data);
    });
  }
}
