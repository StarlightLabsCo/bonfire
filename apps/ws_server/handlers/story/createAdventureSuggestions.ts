import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponseType,
} from 'websocket/types';
import { sendToUser } from '../../src/connection';

export async function createAdventureSuggestionsHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.createAdventureSuggestions) {
    throw new Error('Invalid request type for createAdventureSuggestionsHandler');
  }

  // TODO: fetch prior instances from the db and generate new suggestions
  sendToUser(ws.data.connectionId!, {
    type: StarlightWebSocketResponseType.adventureSuggestionsCreated,
    data: {
      suggestions: ["Steal the Spectral Serpent's Eye", 'Travel to Neo Toyko', 'The Last of Us'],
    },
  });
}
