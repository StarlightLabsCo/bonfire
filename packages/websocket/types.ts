import { Message } from '../database';

// ** --------------------------------- Websocket Request Types --------------------------------- **
// ** Request **
export type StarlightWebSocketRequest =
  | AuthRequest
  | CreateAdventureSuggestionsRequest
  | CreateWelcomeSoundbiteRequest
  | CreateInstanceRequest
  | AddPlayerMessageRequest
  | UndoMessageRequest
  | StopAudioRequest
  | ProcessVoiceTranscriptionRequest
  | HeartbeatClientRequest
  | HeartbeatClientResponse;

export type GenericStarlightWebSocketRequest<T extends StarlightWebSocketRequestType, D> = {
  type: T;
  data: D;
};

export enum StarlightWebSocketRequestType {
  auth,
  createAdventureSuggestions,
  createWelcomeSoundbite,
  createInstance,
  addPlayerMessage,
  undoMessage,
  stopAudio,
  processVoiceTranscription,
  heartbeatClientRequest,
  heartbeatClientResponse,
}

// Auth
export type AuthRequest = GenericStarlightWebSocketRequest<StarlightWebSocketRequestType.auth, AuthData>;

export type AuthData = {
  token: string;
  connectionId: string;
};

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

// Create Welcome Soundbite
export type CreateWelcomeSoundbiteRequest = GenericStarlightWebSocketRequest<
  StarlightWebSocketRequestType.createWelcomeSoundbite,
  CreateWelcomeSoundbiteData
>;

export type CreateWelcomeSoundbiteData = {};

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
  | AuthSuccessResponse
  | AdventureSuggestionsCreatedResponse
  | InstanceCreatedResponse
  | MessageAddedResponse
  | MessageUpdatedResponse
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
  authSuccess,
  adventureSuggestionsCreated,
  instanceCreated,
  messageAdded,
  messageUpdated,
  messageDeleted,
  audioCreated,
  voiceTranscriptionProcessed,
  outOfCredits,
  error,
  heartbeatServerRequest,
  heartbeatServerResponse,
}

// Auth Success
export type AuthSuccessResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.authSuccess,
  AuthSuccessData
>;

export type AuthSuccessData = {};

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

// Message Updated
export type MessageUpdatedResponse = GenericStarlightWebSocketResponse<
  StarlightWebSocketResponseType.messageUpdated,
  MessageUpdatedData
>;

export type MessageUpdatedData = {
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
