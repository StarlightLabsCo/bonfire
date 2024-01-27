import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { unsubscribeWebsocketFromInstance } from '../../src/connection';

export async function unsubscribeFromInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.unsubscribeFromInstance) {
    throw new Error('Invalid request type for unsubscribeFromInstanceHandler');
  }

  unsubscribeWebsocketFromInstance(ws.data.connectionId, request.data.instanceId);
}
