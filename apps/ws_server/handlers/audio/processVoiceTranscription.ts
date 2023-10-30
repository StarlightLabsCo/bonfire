import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function processVoiceTranscriptionHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.processVoiceTranscription) {
    throw new Error('Invalid request type for processVoiceTranscriptionHandler');
  }

  // Add your code here to handle the processVoiceTranscription request
}
