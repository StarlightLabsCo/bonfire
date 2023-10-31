import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export async function finishVoiceTranscriptionHandler(
  ws: ServerWebSocket<WebSocketData>,
  request: StarlightWebSocketRequest,
) {
  if (request.type !== StarlightWebSocketRequestType.finishVoiceTranscription) {
    throw new Error('Invalid request type for finishVoiceTranscriptionHandler');
  }

  // Add your code here to handle the finishVoiceTranscription request
}
