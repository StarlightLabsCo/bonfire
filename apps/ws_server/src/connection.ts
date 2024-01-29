import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { redis, redisSubscriber } from '../services/redis';
import { InstanceConnectedUser, InterReplicaMessage, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket/types';
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

const anonymousImages = [
  { name: 'Anonymous Bear', image: '/anonymous/bear.png' },
  { name: 'Anonymous Bunny', image: '/anonymous/bunny.png' },
  { name: 'Anonymous Elephant', image: '/anonymous/elephant.png' },
  { name: 'Anonymous Fox', image: '/anonymous/fox.webp' },
  { name: 'Anonymous Racoon', image: '/anonymous/racoon.webp' },
  { name: 'Anonymous Tortoise', image: '/anonymous/tortoise.png' },
  { name: 'Anonymous Turtle', image: '/anonymous/turtle.png' },
  { name: 'Anonymous Owl', image: '/anonymous/owl.png' },
  { name: 'Anonymous Dragon', image: '/anonymous/dragon.png' },
  { name: 'Anonymous Panda', image: '/anonymous/panda.png' },
  { name: 'Anonymous Cat', image: '/anonymous/cat.png' },
  { name: 'Anonymous Dog', image: '/anonymous/dog.png' },
  { name: 'Anonymous Raven', image: '/anonymous/raven.png' },
  { name: 'Anonymous Tiger', image: '/anonymous/tiger.png' },
  { name: 'Anonymous Wolf', image: '/anonymous/wolf.png' },
  { name: 'Anonymous Bee', image: '/anonymous/bee.png' },
  { name: 'Anonymous Snail', image: '/anonymous/snail.png' },
  { name: 'Anonymous Rhino', image: '/anonymous/rhino.png' },
  { name: 'Anonymous Dinosaur', image: '/anonymous/dinosaur.png' },
];

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

async function updateInstanceConnectedUsersStatus(instanceId: string) {
  const connectionIds = await redis.smembers(`instanceSubscriptions:${instanceId}`); // Get all the connectionIds subscribed to this instance
  if (!connectionIds || connectionIds.length === 0) return;

  const connectionIdToInstanceConnectedUserMap = new Map<string, InstanceConnectedUser>();

  // Get registered users
  const userIdToConnectionIdMap = new Map<string, string>();
  connectionIds.forEach((connectionId) => {
    const parts = connectionId.split(':');
    if (parts.length > 1) {
      const userId = parts[0];
      userIdToConnectionIdMap.set(userId, connectionId);
    }
  });

  const registeredUsers = await db.user.findMany({
    where: {
      id: {
        in: Array.from(userIdToConnectionIdMap.keys()),
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  registeredUsers.forEach((user) => {
    const connectionId = userIdToConnectionIdMap.get(user.id);
    if (connectionId) {
      connectionIdToInstanceConnectedUserMap.set(connectionId, {
        id: user.id,
        name: user.name,
        image: user.image,
      } as InstanceConnectedUser);
    }
  });

  // Handle anonymous users
  const anonymousUsers = connectionIds.filter((connectionId) => !connectionIdToInstanceConnectedUserMap.has(connectionId));

  anonymousUsers.forEach((connectionId) => {
    const { name, image } = anonymousImages[hashCode(connectionId) % anonymousImages.length];

    connectionIdToInstanceConnectedUserMap.set(connectionId, {
      id: connectionId,
      name,
      image,
    } as InstanceConnectedUser);
  });

  // Send to all the connectionIds - but make it so the current connectionId doesn't get its own data
  for (const connectionId of connectionIdToInstanceConnectedUserMap.keys()) {
    const data = {
      instanceId,
      connectedUsers: Array.from(connectionIdToInstanceConnectedUserMap.entries())
        .filter(([id]) => id !== connectionId) // Exclude the current connectionId
        .map(([, user]) => user), // Get the user data
    };

    sendToWebsocket(connectionId, {
      type: StarlightWebSocketResponseType.instanceConnectedUsersStatus,
      data,
    });
  }
}

export async function sendToInstanceSubscribers(instanceId: string, data: StarlightWebSocketResponse) {
  const subscribers = await redis.smembers(`instanceSubscriptions:${instanceId}`);
  if (subscribers) {
    subscribers.forEach((connectionId) => {
      sendToWebsocket(connectionId, data);
    });
  }
}
