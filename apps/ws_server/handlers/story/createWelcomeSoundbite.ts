import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function createWelcomeSoundbiteHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.createWelcomeSoundbite) {
    throw new Error('Invalid request type for createWelcomeSoundbiteHandler');
  }

  // Add your code here to handle the createWelcomeSoundbite request
  console.log('createWelcomeSoundbite', request);
}
