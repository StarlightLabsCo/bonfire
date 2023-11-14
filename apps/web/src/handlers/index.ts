import { StarlightWebSocketResponseType } from 'websocket';
import { handleHeartbeatRequest } from './heartbeat/heartbeatServerRequest';
import { handleHeartbeatResponse } from './heartbeat/heartbeatServerResponse';
import { handleAdventureSuggestionsCreated } from './lobby/adventureSuggestionsCreated';
import { handleAudioCreated } from './audio/audioCreated';
import { handleVoiceTranscriptionProcessed } from './audio/voiceTranscriptionProcessed';
import { handleInstanceCreated } from './instance/instanceCreated';
import { handleMessageAdded } from './message/messageAdded';
import { handleMessageDeleted } from './message/messageDeleted';
import { handleOutOfCredits } from './outOfCredits';
import { handleError } from './error';
import { handleMessageReplace } from './message/messageReplace';
import { handleMessageUpsert } from './message/messageUpsert';

export const handlers = {
  [StarlightWebSocketResponseType.heartbeatServerRequest]: handleHeartbeatRequest,
  [StarlightWebSocketResponseType.heartbeatServerResponse]: handleHeartbeatResponse,

  [StarlightWebSocketResponseType.adventureSuggestionsCreated]: handleAdventureSuggestionsCreated,
  [StarlightWebSocketResponseType.instanceCreated]: handleInstanceCreated,
  [StarlightWebSocketResponseType.messageAdded]: handleMessageAdded,
  [StarlightWebSocketResponseType.messageReplace]: handleMessageReplace,
  [StarlightWebSocketResponseType.messageUpsert]: handleMessageUpsert,
  [StarlightWebSocketResponseType.messageDeleted]: handleMessageDeleted,
  [StarlightWebSocketResponseType.audioCreated]: handleAudioCreated,
  [StarlightWebSocketResponseType.voiceTranscriptionProcessed]: handleVoiceTranscriptionProcessed,
  [StarlightWebSocketResponseType.outOfCredits]: handleOutOfCredits,
  [StarlightWebSocketResponseType.error]: handleError,
};
