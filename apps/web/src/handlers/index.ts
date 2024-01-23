import { StarlightWebSocketResponseType } from 'websocket';
import { handleHeartbeatRequest } from './heartbeat/heartbeatServerRequest';
import { handleHeartbeatResponse } from './heartbeat/heartbeatServerResponse';
import { handleAdventureSuggestionsCreated } from './lobby/adventureSuggestionsCreated';
import { handleAudioCreated } from './audio/audioCreated';
import { handleAudioTimingsCreated } from './audio/audioTimingsCreated';
import { handleInstanceCreated } from './instance/instanceCreated';
import { handleInstanceLockStatusChanged } from './instance/instanceLockStatusChanged';
import { handleInstanceSubscriptionStatus } from './instance/instanceSubscriptionStatus';
import { handleInstanceConnectedUsersStatus } from './instance/instanceConnectedUsersStatus';
import { handleInstanceStageChanged } from './instance/instanceStageChanged';
import { handleMessageAdded } from './message/messageAdded';
import { handleMessageUpsert } from './message/messageUpsert';
import { handleMessageReplace } from './message/messageReplace';
import { handleMessageDeleted } from './message/messageDeleted';
import { handleOutOfCredits } from './outOfCredits';
import { handleError } from './error';

export const handlers = {
  [StarlightWebSocketResponseType.heartbeatServerRequest]: handleHeartbeatRequest,
  [StarlightWebSocketResponseType.heartbeatServerResponse]: handleHeartbeatResponse,

  [StarlightWebSocketResponseType.adventureSuggestionsCreated]: handleAdventureSuggestionsCreated,
  [StarlightWebSocketResponseType.instanceCreated]: handleInstanceCreated,
  [StarlightWebSocketResponseType.instanceLockStatusChanged]: handleInstanceLockStatusChanged,
  [StarlightWebSocketResponseType.instanceSubscriptionStatus]: handleInstanceSubscriptionStatus,
  [StarlightWebSocketResponseType.instanceConnectedUsersStatus]: handleInstanceConnectedUsersStatus,
  [StarlightWebSocketResponseType.instanceStageChanged]: handleInstanceStageChanged,
  [StarlightWebSocketResponseType.messageAdded]: handleMessageAdded,
  [StarlightWebSocketResponseType.messageReplace]: handleMessageReplace,
  [StarlightWebSocketResponseType.messageUpsert]: handleMessageUpsert,
  [StarlightWebSocketResponseType.messageDeleted]: handleMessageDeleted,
  [StarlightWebSocketResponseType.audioCreated]: handleAudioCreated,
  [StarlightWebSocketResponseType.audioTimingsCreated]: handleAudioTimingsCreated,
  [StarlightWebSocketResponseType.outOfCredits]: handleOutOfCredits,
  [StarlightWebSocketResponseType.error]: handleError,
};
