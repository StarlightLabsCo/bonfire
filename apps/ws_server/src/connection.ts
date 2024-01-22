import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis, redisSubscriber } from '../services/redis';
import { InterReplicaMessage, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateInterReplicaMessage, validateResponse } from 'websocket/utils';
import { db } from '../services/db';

const websocketMap = new Map<string, ServerWebSocket<WebSocketData>>();

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  const connectionId = ws.data.connectionId!;

  // Store the websocket in the global map using connectionId as the key
  websocketMap.set(connectionId, ws);

  // Send any queued messages
  const queuedMessages = await redis.lrange(connectionId, 0, -1);
  for (const message of queuedMessages) {
    const validated = validateResponse(message);
    if (!validated) return;

    ws.send(message);
  }

  // Clear the queue
  await redis.del(connectionId);
}

export async function handleWebsocketDisconnected(ws: ServerWebSocket<WebSocketData>) {
  for (const instanceId of Array.from(ws.data.subscribedInstanceIds)) {
    unsubscribeWebsocketFromInstance(ws.data.connectionId!, instanceId);
  }

  websocketMap.delete(ws.data.connectionId!);
}

// *** User ***
export function sendToWebsocket(connectionId: string, data: StarlightWebSocketResponse, broadcastIfNoWebsocket = true) {
  const websocket = websocketMap.get(connectionId);

  if (typeof websocket === 'undefined') {
    console.log(`No websocket found on this replica for connectionId: ${connectionId}`);

    if (broadcastIfNoWebsocket) {
      // If we don't have the websocket on this replica, publish the message to redis for other replicas to try
      console.log(`Could not find websocket for connection ${connectionId}. Publishing message to redis for other replicas to try`);

      redis.publish(
        'inter-replica-messages',
        JSON.stringify({
          connectionId,
          data,
        } as InterReplicaMessage),
      );
    }

    return;
  }

  if (websocket.readyState !== 1) {
    console.log(`Websocket for connectionId ${connectionId} is not open`);
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

  console.log(`Received message from another replica for connectionId ${validatedMessage.connectionId}, attempting to send`);
  const { connectionId, data } = validatedMessage;

  sendToWebsocket(connectionId, data, false);
});

// *** Instance Publish / Subscribe ***
export async function subscribeWebsocketToInstance(connectionId: string, instanceId: string) {
  console.log(`[Debug] Subscribing connection ${connectionId} to instance ${instanceId}`);

  const result = await redis.sadd(`instanceSubscriptions:${instanceId}`, connectionId);
  console.log(`[Debug] Redis added ${result} number of items to instanceSubscriptions:${instanceId}`);

  const websocket = websocketMap.get(connectionId);
  if (websocket) {
    console.log(`[Debug] Adding instance ${instanceId} to subscribedInstanceIds for connection ${connectionId}`);
    websocket.data.subscribedInstanceIds.push(instanceId);
  }

  sendToWebsocket(connectionId, {
    type: StarlightWebSocketResponseType.instanceSubscriptionStatus,
    data: {
      instanceId,
      subscribed: true,
    },
  });

  updateInstanceConnectedUsersStatus(instanceId);
}

export async function unsubscribeWebsocketFromInstance(connectionId: string, instanceId: string) {
  console.log(`[Debug] Unsubscribing connection ${connectionId} from instance ${instanceId}`);

  const result = await redis.srem(`instanceSubscriptions:${instanceId}`, connectionId);
  console.log(`[Debug] Redis removed ${result} number of items from instanceSubscriptions:${instanceId}`);

  const websocket = websocketMap.get(connectionId);
  if (websocket) {
    console.log(`[Debug] Removing instance ${instanceId} from subscribedInstanceIds for connection ${connectionId}`);
    websocket.data.subscribedInstanceIds = websocket.data.subscribedInstanceIds.filter((id) => id !== instanceId);
  }

  sendToWebsocket(connectionId, {
    type: StarlightWebSocketResponseType.instanceSubscriptionStatus,
    data: {
      instanceId,
      subscribed: false,
    },
  });

  const connectionIds = await redis.smembers(`instanceSubscriptions:${instanceId}`);
  if (!connectionIds || connectionIds.length === 0) {
    await redis.del(`instanceSubscriptions:${instanceId}`);
  }

  updateInstanceConnectedUsersStatus(instanceId);
}

async function updateInstanceConnectedUsersStatus(instanceId: string) {
  console.log(`[Debug] Updating instance connected users status for instance: ${instanceId}`);

  const connectionIds = await redis.smembers(`instanceSubscriptions:${instanceId}`); // Get all the connectionIds subscribed to this instance
  if (!connectionIds || connectionIds.length === 0) return;

  const userIds = connectionIds.map((connectionId) => connectionId.split('-')[0]); // Get all the userIds from the connectionIds

  const connectedUsers = await db.user.findMany({
    where: {
      id: {
        in: userIds,
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
    subscribers.forEach((connectionId) => {
      sendToWebsocket(connectionId, data);
    });
  }
}
