import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

import { isInstancePlayer } from './isInstancePlayer';
import { withInstanceLock } from './withInstanceLock';
import { hasTokensMiddleware } from './hasTokensMiddleware';

import { stopAudioHandler } from './audio/stopAudio';

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

  // *** Paid requests ***
  [StarlightWebSocketRequestType.createAdventureSuggestions]: hasTokensMiddleware(createAdventureSuggestionsHandler),
  [StarlightWebSocketRequestType.createInstance]: hasTokensMiddleware(createInstanceHandler),

  [StarlightWebSocketRequestType.addPlayerMessage]: isInstancePlayer(hasTokensMiddleware(withInstanceLock(addPlayerMessageHandler))),
  [StarlightWebSocketRequestType.undoMessage]: isInstancePlayer(hasTokensMiddleware(withInstanceLock(undoMessageHandler))),
  [StarlightWebSocketRequestType.resumeInstance]: isInstancePlayer(hasTokensMiddleware(withInstanceLock(resumeInstanceHandler))),
};
