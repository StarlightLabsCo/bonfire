import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function addPlayerMessageHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.addPlayerMessage) {
    throw new Error('Invalid request type for addPlayerMessageHandler');
  }

  // Add your code here to handle the addPlayerMessage request
}
