console.log(
  `[Bun: ${Bun.version}] [Node: ${process.version}] [PID: ${process.pid}] [ENV: ${process.env.NODE_ENV}] Starting websocket server...`,
);

import { v4 as uuidv4 } from 'uuid';
import { WebSocketAuthenticationToken } from 'database';
import { db } from '../services/db';

import { StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { validateRequest } from 'websocket/utils';

import { handlers } from '../handlers';
import { handleWebsocketConnected, handleWebsocketDisconnected, sendToWebsocket } from './connection';
import { clearHeartbeat, heartbeatClientRequestHandler, heartbeatClientResponseHandler, setupHeartbeat } from './heartbeat';

export type WebSocketData = {
  // Heartbeat
  isAlive: boolean;
  heartbeatInterval: NodeJS.Timeout | null;

  // User data
  webSocketToken: WebSocketAuthenticationToken | null;
  connectionId: string;

  // Instance data
  subscribedInstanceIds: string[];
};

const server = Bun.serve<WebSocketData>({
  port: process.env.PORT ? parseInt(process.env.PORT) : 80,
  async fetch(req, server) {
    let connectionId: string = uuidv4();

    // Auth via query params
    let webSocketToken: WebSocketAuthenticationToken | null = null;

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (token) {
      webSocketToken = await db.webSocketAuthenticationToken.findUnique({
        where: {
          token,
        },
      });

      if (!webSocketToken || webSocketToken.expires < new Date()) {
        return new Response('Invalid authentication token.', { status: 400 });
      }

      connectionId = `${webSocketToken.userId}:${connectionId}`;
    }

    // Success - Upgrade to websocket
    const success = server.upgrade(req, {
      data: {
        heartbeatInterval: null,
        isAlive: true,
        webSocketToken: webSocketToken,
        connectionId: connectionId,
        subscribedInstanceIds: [],
      },
    });

    if (success) {
      return undefined; // Bun automatically returns a 101 Switching Protocols
    }

    return new Response('Not found', { status: 404 });
  },
  websocket: {
    async open(ws) {
      handleWebsocketConnected(ws);
      setupHeartbeat(ws);
    },

    async message(ws, message) {
      const request = validateRequest(message);
      if (!request) return;

      // Heartbeat
      if (request.type === StarlightWebSocketRequestType.heartbeatClientRequest) {
        return await heartbeatClientRequestHandler(ws, request); // Client sent us a ping, we need to respond
      }

      if (request.type === StarlightWebSocketRequestType.heartbeatClientResponse) {
        return await heartbeatClientResponseHandler(ws, request); // Client responded to our ping
      }

      // Handle request
      const handler = handlers[request.type as keyof typeof handlers];

      if (!handler) {
        console.error('No handler found for ' + request.type);
        return sendToWebsocket(ws.data.connectionId, {
          type: StarlightWebSocketResponseType.error,
          data: {
            message: 'Invalid request.',
          },
        });
      }

      try {
        await handler(ws, request);
      } catch (error) {
        console.error('Error handling request: ', error);
        sendToWebsocket(ws.data.connectionId, {
          type: StarlightWebSocketResponseType.error,
          data: {
            message: 'Error handling request. Please try again.',
          },
        });
      }
    },

    async close(ws) {
      console.log('Websocket closed. Connection Id:', ws.data.connectionId);

      if (ws.data.webSocketToken) {
        await db.webSocketAuthenticationToken.delete({
          where: {
            id: ws.data.webSocketToken.id,
          },
        });
      }

      clearHeartbeat(ws);
      handleWebsocketDisconnected(ws);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
