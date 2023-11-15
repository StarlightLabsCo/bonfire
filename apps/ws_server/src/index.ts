import { WebSocketAuthenticationToken } from 'database';
import { db } from '../services/db';

import { StarlightWebSocketRequestType } from 'websocket/types';
import { validateRequest } from 'websocket/utils';

import { handleWebsocketConnected } from './connection';
import { handlers } from '../handlers';
import {
  clearHeartbeat,
  heartbeatClientRequestHandler,
  heartbeatClientResponseHandler,
  setupHeartbeat,
} from './heartbeat';

export type WebSocketData = {
  // Heartbeat
  isAlive: boolean;
  heartbeatInterval: NodeJS.Timeout | null;

  // User data
  webSocketToken: WebSocketAuthenticationToken | null;
  connectionId: string | null; // userId-connectionIdFromClient
};

const server = Bun.serve<WebSocketData>({
  port: process.env.PORT ? parseInt(process.env.PORT) : 80,
  async fetch(req, server) {
    // Auth via query param
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Missing authentication token.', { status: 400 });
    }

    // TODO: figure out a way to have websocket auth tokens already in memory - remote db call makes things slow
    const webSocketToken = await db.webSocketAuthenticationToken.findUnique({
      where: {
        token,
      },
    });

    if (!webSocketToken || webSocketToken.expires < new Date()) {
      return new Response('Invalid authentication token.', { status: 400 });
    }

    // Get connectionId from query param
    const connectionId = url.searchParams.get('connectionId');

    if (!connectionId) {
      return new Response('Missing connectionId.', { status: 400 });
    }

    // Success - Upgrade to websocket
    const success = server.upgrade(req, {
      data: {
        heartbeatInterval: null,
        isAlive: true,
        webSocketToken: webSocketToken,
        connectionId: `${webSocketToken.userId}-${connectionId}`,
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
        heartbeatClientRequestHandler(ws, request); // Client sent us a ping, we need to respond
        return;
      } else if (request.type === StarlightWebSocketRequestType.heartbeatClientResponse) {
        heartbeatClientResponseHandler(ws, request); // Client responded to our ping
        return;
      }

      const handler = handlers[request.type as keyof typeof handlers];
      if (handler) {
        handler(ws, request);
      } else {
        console.error('No handler found for ' + request.type);
      }
    },

    async close(ws) {
      console.log('Websocket closed. ', ws.data.connectionId);

      await db.webSocketAuthenticationToken.delete({
        where: {
          id: ws.data.webSocketToken!.id,
        },
      });

      clearHeartbeat(ws);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
