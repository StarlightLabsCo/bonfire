import { WebSocketAuthenticationToken } from 'database';

import { StarlightWebSocketRequestType } from 'websocket/types';
import { validateRequest } from 'websocket/utils';
import { clearWebsocketFromConnection } from './connection';
import { handlers } from '../handlers';

// Data that is stored on the websocket connection
export type WebSocketData = {
  timeout: Timer | null;
  heartbeat: Timer | null;
  webSocketToken: WebSocketAuthenticationToken | null;
  connectionId: string | null;
};

const server = Bun.serve<WebSocketData>({
  port: process.env.PORT ? parseInt(process.env.PORT) : 80,
  async fetch(req, server) {
    const success = server.upgrade(req, {
      data: {
        timeout: null,
        heartbeat: null,
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
    async message(ws, message) {
      const request = validateRequest(message);
      if (!request) return;

      if (!ws.data.webSocketToken) {
        if (request.type !== StarlightWebSocketRequestType.auth) {
          console.error('Unauthorized websocket message.');
          return;
        }
      }

      const handler = handlers[request.type as keyof typeof handlers];
      if (handler) {
        handler(ws, request);
      } else {
        console.error('No handler found for ' + request.type);
      }
    },

    async close(ws) {
      console.log(
        'Websocket closed. ' + ws.remoteAddress + ' ' + ws.data.webSocketToken,
      );

      if (ws.data.timeout) {
        clearTimeout(ws.data.timeout);
      }

      if (ws.data.heartbeat) {
        clearInterval(ws.data.heartbeat);
      }

      clearWebsocketFromConnection(ws.data.connectionId);
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
