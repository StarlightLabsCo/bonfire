import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';

import { isInstancePlayer } from './middleware/isInstancePlayer';
import { hasTokens } from './middleware/hasTokens';
import { withInstanceLock } from './middleware/withInstanceLock';

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
  [StarlightWebSocketRequestType.subscribeToInstance]: subscribeToInstanceHandler,
  [StarlightWebSocketRequestType.unsubscribeFromInstance]: unsubscribeFromInstanceHandler,

  // *** Paid requests ***
  [StarlightWebSocketRequestType.createAdventureSuggestions]: hasTokens(createAdventureSuggestionsHandler),
  [StarlightWebSocketRequestType.createInstance]: hasTokens(createInstanceHandler),

  [StarlightWebSocketRequestType.addPlayerMessage]: isInstancePlayer(hasTokens(withInstanceLock(addPlayerMessageHandler))),
  [StarlightWebSocketRequestType.undoMessage]: isInstancePlayer(hasTokens(withInstanceLock(undoMessageHandler))),
  [StarlightWebSocketRequestType.resumeInstance]: isInstancePlayer(hasTokens(withInstanceLock(resumeInstanceHandler))),
};
