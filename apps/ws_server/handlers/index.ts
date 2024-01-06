import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

import { withInstanceLock } from './withInstanceLock';
import { hasTokensMiddleware } from './hasTokensMiddleware';

import { stopAudioHandler } from './audio/stopAudio';
import { processVoiceTranscriptionHandler } from './audio/processVoiceTranscription';
import { finishVoiceTranscriptionHandler } from './audio/finishVoiceTranscription';
import { createInstanceTemplateHandler } from './instanceTemplate/createInstanceTemplate';

import { createAdventureSuggestionsHandler } from './lobby/createAdventureSuggestions';
import { createInstanceHandler } from './instance/createInstance';
import { subscribeToInstanceHandler } from './instance/subscribeToInstance';
import { unsubscribeFromInstanceHandler } from './instance/unsubscribeFromInstance';
import { addPlayerMessageHandler } from './instance/addPlayerMessage';
import { undoMessageHandler } from './instance/undoMessage';
import { resumeInstanceHandler } from './instance/resumeInstance';

export const handlers: {
  [key: string]: (ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) => void;
} = {
  // *** Free requests ***
  [StarlightWebSocketRequestType.stopAudio]: stopAudioHandler,
  [StarlightWebSocketRequestType.subscribeToInstance]: subscribeToInstanceHandler,
  [StarlightWebSocketRequestType.unsubscribeFromInstance]: unsubscribeFromInstanceHandler,
  [StarlightWebSocketRequestType.createInstanceTemplate]: createInstanceTemplateHandler,

  // *** Paid requests ***
  [StarlightWebSocketRequestType.createAdventureSuggestions]: hasTokensMiddleware(createAdventureSuggestionsHandler),
  [StarlightWebSocketRequestType.createInstance]: hasTokensMiddleware(createInstanceHandler),
  [StarlightWebSocketRequestType.processVoiceTranscription]: hasTokensMiddleware(processVoiceTranscriptionHandler),
  [StarlightWebSocketRequestType.finishVoiceTranscription]: hasTokensMiddleware(finishVoiceTranscriptionHandler),

  [StarlightWebSocketRequestType.addPlayerMessage]: withInstanceLock(hasTokensMiddleware(addPlayerMessageHandler)),
  [StarlightWebSocketRequestType.undoMessage]: withInstanceLock(hasTokensMiddleware(undoMessageHandler)),
  [StarlightWebSocketRequestType.resumeInstance]: withInstanceLock(hasTokensMiddleware(resumeInstanceHandler)),
};
