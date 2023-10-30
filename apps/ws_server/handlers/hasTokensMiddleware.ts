import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest } from 'websocket/types';

export function hasTokensMiddleware(
  handler: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => void,
) {
  return async (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => {
    // TODO: Add your code here to check if the user has enough tokens to perform the action

    await handler(ws, request);
  };
}
