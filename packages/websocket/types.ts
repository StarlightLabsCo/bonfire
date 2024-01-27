import { InstanceStage, Message } from '../database';

// ** --------------------------------- Websocket Request Types --------------------------------- **
// ** Request **
export type StarlightWebSocketRequest =
  | CreateAdventureSuggestionsRequest
  | CreateInstanceRequest
  | SubscribeToInstanceRequest
  | UnsuscribeFromInstanceRequest
  | ResumeInstanceRequest
  | AddPlayerMessageRequest
  | UndoMessageRequest
  | HeartbeatClientRequest
  | HeartbeatClientResponse;

export type GenericStarlightWebSocketRequest<T extends StarlightWebSocketRequestType, D> = {
  type: T;
  data: D;
};

export enum StarlightWebSocketRequestType {
  createAdventureSuggestions,
  createInstance,
  subscribeToInstance,
  unsubscribeFromInstance,
  resumeInstance,
  addPlayerMessage,
  undoMessage,
  heartbeatClientRequest,
  heartbeatClientResponse,
}

// Create Adventure Suggestions
export type CreateAdventureSuggestionsRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.createAdventureSuggestions,
  CreateAdventureSuggestionsData
>;

export type CreateAdventureSuggestionsData = {};

// Create Instance
export type CreateInstanceRequest = GenericStarlightWebSocketRequest<StarlightWebSocketRequestType.createInstance, CreateInstanceData>;

export type CreateInstanceData = {
  description: string | null;
  narratorPrompt: string | null;
  narratorVoiceId: string;
  narratorResponseLength: number;
  storyOutline: string | null;
  imageStyle: string | null;
};

// Subscribe To Instance
export type SubscribeToInstanceRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.subscribeToInstance,
  SubscribeToInstanceData
>;

export type SubscribeToInstanceData = {
  instanceId: string;
};

// Unsubscribe From Instance
export type UnsuscribeFromInstanceRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.unsubscribeFromInstance,
  UnsuscribeFromInstanceData
>;

export type UnsuscribeFromInstanceData = {
  instanceId: string;
};

// Resume Instance
export type ResumeInstanceRequest = GenericStarlightWebSocketRequest<StarlightWebSocketRequestType.resumeInstance, ResumeInstanceData>;

export type ResumeInstanceData = {
  instanceId: string;
};

// Add Player Message
export type AddPlayerMessageRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.addPlayerMessage,
  AddPlayerMessageData
>;

export type AddPlayerMessageData = {
  instanceId: string;
  message: string;
};

// Undo Message
export type UndoMessageRequest = GenericStarlightWebSocketRequest<StarlightWebSocketRequestType.undoMessage, UndoMessageData>;

export type UndoMessageData = {
  instanceId: string;
};

// Heartbeat Client Request
export type HeartbeatClientRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.heartbeatClientRequest,
  HeartbeatClientRequestData
>;

export type HeartbeatClientRequestData = {
  timestamp: number;
};

// Heartbeat Client Response
export type HeartbeatClientResponse = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.heartbeatClientResponse,
  HeartbeatClientResponseData
>;

export type HeartbeatClientResponseData = {
  timestamp: number;
  receivedTimestamp: number;
};

// ** --------------------------------- Websocket Response Types --------------------------------- **
export type StarlightWebSocketResponse =
  | AdventureSuggestionsCreatedResponse
  | InstanceCreatedResponse
  | InstanceLockStatusChangedResponse
  | InstanceSubscriptionStatusResponse
  | InstanceConnectedUsersStatusResponse
  | InstanceStageChangedResponse
  | MessageAddedResponse
  | MessageReplaceResponse
  | MessageUpsertResponse
  | MessageDeletedResponse
  | AudioCreatedResponse
  | AudioTimingsCreatedResponse
  | OutOfCreditsResponse
  | ErrorResponse
  | HeartbeatServerRequest
  | HeartbeatServerResponse;

export type GenericStarlightWebSocketResponse<T extends StarlightWebSocketResponseType, D> = {
  type: T;
  data: D;
};

export enum StarlightWebSocketResponseType {
  adventureSuggestionsCreated,
  instanceCreated,
  instanceLockStatusChanged,
  instanceSubscriptionStatus,
  instanceConnectedUsersStatus,
  instanceStageChanged,
  messageAdded,
  messageReplace,
  messageUpsert,
  messageDeleted,
  audioCreated,
  audioTimingsCreated,
  outOfCredits,
  error,
  heartbeatServerRequest,
  heartbeatServerResponse,
}

// Adventure Suggestions Created
export type AdventureSuggestionsCreatedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.adventureSuggestionsCreated,
  AdventureSuggestionsCreatedData
>;

export type AdventureSuggestionsCreatedData = {
  suggestions: string[];
};

// Instance Created
export type InstanceCreatedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.instanceCreated,
  InstanceCreatedData
>;

export type InstanceCreatedData = {
  instanceId: string;
};

// Instance Lock Status Changed
export type InstanceLockStatusChangedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.instanceLockStatusChanged,
  InstanceLockStatusChangedData
>;

export type InstanceLockStatusChangedData = {
  instanceId: string;
  locked: boolean;
  lockedAt: Date | null;
};

// Instance Subscription Confirmation
export type InstanceSubscriptionStatusResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.instanceSubscriptionStatus,
  InstanceSubscriptionStatusData
>;

export type InstanceSubscriptionStatusData = {
  instanceId: string;
  subscribed: boolean;
};

// Instance Connected Users Status
export type InstanceConnectedUsersStatusResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.instanceConnectedUsersStatus,
  InstanceConnectedUsersStatusData
>;

export type InstanceConnectedUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export type InstanceConnectedUsersStatusData = {
  instanceId: string;
  registeredUsers: InstanceConnectedUser[];
  anonymousUsers: number;
};

// Instance Stage Changed
export type InstanceStageChangedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.instanceStageChanged,
  InstanceStageChangedData
>;

export type InstanceStageChangedData = {
  instanceId: string;
  stage: InstanceStage;
};

// Message Added
export type MessageAddedResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.messageAdded, MessageAddedData>;

export type MessageAddedData = {
  instanceId: string;
  message: Message;
};

export type ActionSuggestion = {
  action: string;
  modifier_reason: string;
  modifier: number;
};

// Message Replace
export type MessageReplaceResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.messageReplace, MessageReplaceData>;

export type MessageReplaceData = {
  instanceId: string;
  messageId: string;
  content: string;
};

// Message Upsert
export type MessageUpsertResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.messageUpsert, MessageUpsertData>;

export type MessageUpsertData = {
  instanceId: string;
  message: Message;
};

// Message Deleted
export type MessageDeletedResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.messageDeleted, MessageDeletedData>;

export type MessageDeletedData = {
  instanceId: string;
  messageId: string;
};

// Audio Created
export type AudioCreatedResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.audioCreated, AudioCreatedData>;

export type AudioCreatedData = {
  audio: string | null; // base64 encoded audio
  start: boolean;
  end: boolean;
};

// Audio Timings Created
export type AudioTimingsCreatedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.audioTimingsCreated,
  AudioTimingsCreatedData
>;

export type AudioWordTimings = {
  words: string[];
  wordStartTimesMs: number[];
  wordDurationsMs: number[];
};

export type AudioTimingsCreatedData = {
  timings: AudioWordTimings;
};

// Out Of Credits
export type OutOfCreditsResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.outOfCredits, OutOfCreditsData>;

export type OutOfCreditsData = {};

// Error
export type ErrorResponse = GenericStarlightWebSocketResponse<StarlightWebSocketResponseType.error, ErrorData>;

export type ErrorData = {
  message: string;
};

// Heartbeat Server Request
export type HeartbeatServerRequest = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.heartbeatServerRequest,
  HeartbeatServerRequestData
>;

export type HeartbeatServerRequestData = {
  timestamp: number;
};

// Heartbeat Server Response
export type HeartbeatServerResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.heartbeatServerResponse,
  HeartbeatServerResponseData
>;

export type HeartbeatServerResponseData = {
  timestamp: number;
  receivedTimestamp: number;
};

// ** --------------------------------- Intranetwork Redis Message --------------------------------- **
export type InterReplicaMessage = {
  connectionId: string;
  data: StarlightWebSocketResponse;
};
