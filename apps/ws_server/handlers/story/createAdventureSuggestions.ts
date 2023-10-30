import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function createAdventureSuggestionsHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.createAdventureSuggestions) {
    throw new Error('Invalid request type for createAdventureSuggestionsHandler');
  }

  // generateAdventureSuggestions(ws, ws.data.webSocketToken!.userId);
}
