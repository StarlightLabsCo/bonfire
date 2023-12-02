import { StarlightWebSocketResponseType } from 'websocket';
import { handleHeartbeatRequest } from './heartbeat/heartbeatServerRequest';
import { handleHeartbeatResponse } from './heartbeat/heartbeatServerResponse';
import { handleAdventureSuggestionsCreated } from './lobby/adventureSuggestionsCreated';
import { handleAudioCreated } from './audio/audioCreated';
import { handleAudioTimingsCreated } from './audio/audioTimingsCreated';
import { handleVoiceTranscriptionProcessed } from './audio/voiceTranscriptionProcessed';
import { handleInstanceCreated } from './instance/instanceCreated';
import { handleMessageAdded } from './message/messageAdded';
import { handleMessageUpsert } from './message/messageUpsert';
import { handleMessageReplace } from './message/messageReplace';
import { handleMessageDeleted } from './message/messageDeleted';
import { handleOutOfCredits } from './outOfCredits';
import { handleAnotherOpenTab } from './anotherOpenTab';
import { handleError } from './error';

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
  [StarlightWebSocketResponseType.audioTimingsCreated]: handleAudioTimingsCreated,
  [StarlightWebSocketResponseType.voiceTranscriptionProcessed]: handleVoiceTranscriptionProcessed,
  [StarlightWebSocketResponseType.outOfCredits]: handleOutOfCredits,
  [StarlightWebSocketResponseType.anotherOpenTab]: handleAnotherOpenTab,
  [StarlightWebSocketResponseType.error]: handleError,
};
