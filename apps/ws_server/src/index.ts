import { WebSocketAuthenticationToken } from 'database';

import { StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { validateRequest } from 'websocket/utils';

import { clearWebsocketFromConnection } from './connection';
import { handlers } from '../handlers';
import { authHandler, clearAuthTimeout, setupAuthTimeout } from './auth';
import {
  clearHeartbeat,
  heartbeatClientRequestHandler,
  heartbeatClientResponseHandler,
  setupHeartbeat,
} from './heartbeat';

export type WebSocketData = {
  // Authentication timeout
  timeout: NodeJS.Timeout | null;

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
    const success = server.upgrade(req, {
      data: {
        timeout: null,
        heartbeatInterval: null,
        isAlive: true,
        webSocketToken: null,
        connectionId: null,
      },
    });

    if (success) {
      return undefined; // Bun automatically returns a 101 Switching Protocols
    }

    return new Response('Not found', { status: 404 });
  },
  websocket: {
    async open(ws) {
      setupAuthTimeout(ws);
      setupHeartbeat(ws);
    },

    async message(ws, message) {
      const request = validateRequest(message);
      if (!request) return;

      // Auth
      if (!ws.data.webSocketToken) {
        if (request.type === StarlightWebSocketRequestType.auth) {
          authHandler(ws, request);
          return;
        } else {
          console.error(`[${ws.remoteAddress}] Unauthorized websocket message.`);
          return;
        }
      }

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
      console.log('Websocket closed. ' + ws.remoteAddress + ' ' + ws.data.webSocketToken);

      clearAuthTimeout(ws);
      clearHeartbeat(ws);

      if (!ws.data.connectionId) return;

      clearWebsocketFromConnection(ws.data.connectionId);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
