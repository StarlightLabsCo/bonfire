import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function undoMessageHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.undoMessage) {
    throw new Error('Invalid request type for undoMessageHandler');
  }

  // Add your code here to handle the undoMessage request
  console.log('undoMessageHandler', request);
}
