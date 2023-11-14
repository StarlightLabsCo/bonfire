import { Message } from '../database';

// ** --------------------------------- Websocket Request Types --------------------------------- **
// ** Request **
export type StarlightWebSocketRequest =
  | CreateAdventureSuggestionsRequest
  | CreateInstanceRequest
  | AddPlayerMessageRequest
  | UndoMessageRequest
  | StopAudioRequest
  | ProcessVoiceTranscriptionRequest
  | FinishVoiceTranscriptionRequest
  | HeartbeatClientRequest
  | HeartbeatClientResponse;

export type GenericStarlightWebSocketRequest<T extends StarlightWebSocketRequestType, D> = {
  type: T;
  data: D;
};

export enum StarlightWebSocketRequestType {
  createAdventureSuggestions,
  createInstance,
  addPlayerMessage,
  undoMessage,
  stopAudio,
  processVoiceTranscription,
  finishVoiceTranscription,
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
export type CreateInstanceRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.createInstance,
  CreateInstanceData
>;

export type CreateInstanceData = {
  description: string;
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
export type UndoMessageRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.undoMessage,
  UndoMessageData
>;

export type UndoMessageData = {
  instanceId: string;
};

// Stop Audio
export type StopAudioRequest = GenericStarlightWebSocketRequest<StarlightWebSocketRequestType.stopAudio, StopAudioData>;

export type StopAudioData = {};

// Process Voice Transcription
export type ProcessVoiceTranscriptionRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.processVoiceTranscription,
  ProcessVoiceTranscriptionData
>;

export type ProcessVoiceTranscriptionData = {
  audio: string; // base64 encoded audio
};

export type FinishVoiceTranscriptionRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.finishVoiceTranscription,
  FinishVoiceTranscriptionData
>;

export type FinishVoiceTranscriptionData = {};

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
  | MessageAddedResponse
  | MessageReplaceResponse
  | MessageUpsertResponse
  | MessageDeletedResponse
  | AudioCreatedResponse
  | VoiceTranscriptionProcessedResponse
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
  messageAdded,
  messageReplace,
  messageUpsert,
  messageDeleted,
  audioCreated,
  voiceTranscriptionProcessed,
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

// Message Added
export type MessageAddedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.messageAdded,
  MessageAddedData
>;

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
export type MessageReplaceResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.messageReplace,
  MessageReplaceData
>;

export type MessageReplaceData = {
  instanceId: string;
  messageId: string;
  content: string;
};

// Message Upsert
export type MessageUpsertResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.messageUpsert,
  MessageUpsertData
>;

export type MessageUpsertData = {
  instanceId: string;
  message: Message;
};

// Message Deleted
export type MessageDeletedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.messageDeleted,
  MessageDeletedData
>;

export type MessageDeletedData = {
  instanceId: string;
  messageId: string;
};

// Audio Created
export type AudioCreatedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.audioCreated,
  AudioCreatedData
>;

export type AudioCreatedData = {
  audio: string; // base64 encoded audio
};

// Voice Transcription Processed
export type VoiceTranscriptionProcessedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.voiceTranscriptionProcessed,
  VoiceTranscriptionProcessedData
>;

export type VoiceTranscriptionProcessedData = {
  transcription: string;
};

// Out Of Credits
export type OutOfCreditsResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.outOfCredits,
  OutOfCreditsData
>;

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
