import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis, redisSubscriber } from '../services/redis';
import { InterReplicaMessage, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
import { validateInterReplicaMessage } from 'websocket/utils';
import { db } from '../services/db';

const websocketMap = new Map<string, ServerWebSocket<WebSocketData>>();

// Timer to display the number of connected users
setInterval(() => {
  console.log(`Connected sockets: ${websocketMap.size}`);
}, 1000 * 60);

export async function handleWebsocketConnected(ws: ServerWebSocket<WebSocketData>) {
  websocketMap.set(ws.data.connectionId, ws);
}

export async function handleWebsocketDisconnected(ws: ServerWebSocket<WebSocketData>) {
  for (const instanceId of Array.from(ws.data.subscribedInstanceIds)) {
    await unsubscribeWebsocketFromInstance(ws.data.connectionId, instanceId);
  }

  websocketMap.delete(ws.data.connectionId);
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

  websocket.send(JSON.stringify(data));
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
  await redis.sadd(`instanceSubscriptions:${instanceId}`, connectionId);

  const websocket = websocketMap.get(connectionId);
  if (websocket) {
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
  await redis.srem(`instanceSubscriptions:${instanceId}`, connectionId);

  const websocket = websocketMap.get(connectionId);
  if (websocket) {
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
  const connectionIds = await redis.smembers(`instanceSubscriptions:${instanceId}`); // Get all the connectionIds subscribed to this instance
  if (!connectionIds || connectionIds.length === 0) return;

  let anonymousUsers = 0;
  const userIds = connectionIds.reduce((acc: string[], connectionId) => {
    const parts = connectionId.split(':');
    if (parts.length > 1) {
      acc.push(parts[0]); // Get all the userIds from the connectionIds
    } else {
      anonymousUsers++;
    }
    return acc;
  }, []);

  const registeredUsers = await db.user.findMany({
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

  console.log(
    `Updating instance ${instanceId} connected users status. Registered: ${registeredUsers.length}, Anonymous: ${anonymousUsers}`,
  );

  sendToInstanceSubscribers(instanceId, {
    type: StarlightWebSocketResponseType.instanceConnectedUsersStatus,
    data: {
      instanceId,
      registeredUsers,
      anonymousUsers,
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
