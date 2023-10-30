import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function stopAudioHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.stopAudio) {
    throw new Error('Invalid request type for stopAudioHandler');
  }

  // Add your code here to handle the stopAudio request
}
