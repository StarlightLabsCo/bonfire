import { db } from '../services/db';
import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { handleWebsocketConnected } from './connection';

export function setupAuthTimeout(ws: ServerWebSocket<WebSocketData>) {
  const timeout = setTimeout(() => {
    console.log(`[${ws.remoteAddress}] Closing websocket due to timeout. Did not authenticate.`);
    ws.close();
  }, 2000);

  ws.data.timeout = timeout;
}

export async function authHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.auth) {
    throw new Error('Invalid request type for authHandler');
  }

  const { token, connectionId } = request.data;

  const webSocketToken = await db.webSocketAuthenticationToken.findUnique({
    where: {
      token,
    },
  });

  if (!webSocketToken || webSocketToken.expires < new Date()) {
    console.error('Provided token is invalid.');
    return;
  } else {
    clearTimeout(ws.data.timeout!);

    ws.data.webSocketToken = webSocketToken;
    ws.data.connectionId = `${webSocketToken.userId}-${connectionId}`;

    handleWebsocketConnected(ws);

    console.log('Websocket authenticated. User ID: ' + webSocketToken.userId + '. Connection ID: ' + token);
  }

  // WebsocketAuthTokens are one-time use, so delete it now that it's been used
  await db.webSocketAuthenticationToken.delete({
    where: {
      token,
    },
  });
}

export function clearAuthTimeout(ws: ServerWebSocket<WebSocketData>) {
  if (ws.data.timeout) {
    clearTimeout(ws.data.timeout);
    ws.data.timeout = null;
  }
}
