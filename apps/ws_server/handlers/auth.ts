import { db } from '../services/prisma';
import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
} from 'websocket/types';
import { handleWebsocketConnected } from '../src/connection';

export async function authHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
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
    clearTimeout(ws.data.timeout!); // Clear the auth kick timeout

    ws.data.webSocketToken = webSocketToken;
    ws.data.connectionId = connectionId;

    handleWebsocketConnected(connectionId, ws);

    console.log(
      'Websocket authenticated. User ID: ' +
        webSocketToken.userId +
        '. Connection ID: ' +
        token,
    );
  }
}
