import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';

import { hasTokensMiddleware } from './hasTokensMiddleware';

import { stopAudioHandler } from './audio/stopAudio';
import { processVoiceTranscriptionHandler } from './audio/processVoiceTranscription';
import { finishVoiceTranscriptionHandler } from './audio/finishVoiceTranscription';

import { createAdventureSuggestionsHandler } from './story/createAdventureSuggestions';
import { createInstanceHandler } from './story/createInstance';
import { addPlayerMessageHandler } from './story/addPlayerMessage';
import { undoMessageHandler } from './story/undoMessage';

import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

export const handlers: {
  [key: string]: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => void;
} = {
  // Free requests
  [StarlightWebSocketRequestType.stopAudio]: stopAudioHandler,

  // Paid requests
  [StarlightWebSocketRequestType.createAdventureSuggestions]: hasTokensMiddleware(createAdventureSuggestionsHandler),
  [StarlightWebSocketRequestType.createInstance]: hasTokensMiddleware(createInstanceHandler),
  [StarlightWebSocketRequestType.addPlayerMessage]: hasTokensMiddleware(addPlayerMessageHandler),
  [StarlightWebSocketRequestType.undoMessage]: hasTokensMiddleware(undoMessageHandler),
  [StarlightWebSocketRequestType.processVoiceTranscription]: hasTokensMiddleware(processVoiceTranscriptionHandler),
  [StarlightWebSocketRequestType.finishVoiceTranscription]: hasTokensMiddleware(finishVoiceTranscriptionHandler),
};
