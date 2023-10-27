import { Message } from '../database';

// ** --------------------------------- Request Types --------------------------------- **
// ** Request **
export enum StarlightWebSocketRequestType {
  auth,
  createAdventureSuggestions,
  createWelcomeSoundbite,
  createInstance,
  addPlayerMessage,
  undoMessage,
  stopAudio,
  processVoiceTranscription,
}

export type StarlightWebSocketRequest =
  | { type: StarlightWebSocketRequestType.auth; data: AuthData }
  | {
      type: StarlightWebSocketRequestType.createAdventureSuggestions;
      data: CreateAdventureSuggestionsData;
    }
  | {
      type: StarlightWebSocketRequestType.createWelcomeSoundbite;
      data: CreateWelcomeSoundbiteData;
    }
  | {
      type: StarlightWebSocketRequestType.createInstance;
      data: CreateInstanceData;
    }
  | {
      type: StarlightWebSocketRequestType.addPlayerMessage;
      data: AddPlayerMessageData;
    }
  | {
      type: StarlightWebSocketRequestType.undoMessage;
      data: UndoMessageData;
    }
  | {
      type: StarlightWebSocketRequestType.stopAudio;
      data: StopAudioData;
    }
  | {
      type: StarlightWebSocketRequestType.processVoiceTranscription;
      data: ProcessVoiceTranscriptionData;
    };

// ** Data **
export type AuthData = {
  token: string;
};

export type CreateAdventureSuggestionsData = {};

export type CreateInstanceData = {
  description: string;
};

export type CreateWelcomeSoundbiteData = {};

export type AddPlayerMessageData = {
  instanceId: string;
  message: string;
};

export type UndoMessageData = {
  instanceId: string;
};

export type StopAudioData = {};

export type ProcessVoiceTranscriptionData = {
  audio: string; // base64 encoded audio
};

// ** --------------------------------- Response Types --------------------------------- **
// ** Response **
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
}

export type StarlightWebSocketResponse =
  | { type: StarlightWebSocketResponseType.authSuccess; data: AuthSuccessData }
  | {
      type: StarlightWebSocketResponseType.adventureSuggestionsCreated;
      data: AdventureSuggestionsCreatedData;
    }
  | {
      type: StarlightWebSocketResponseType.instanceCreated;
      data: InstanceCreatedData;
    }
  | {
      type: StarlightWebSocketResponseType.messageAdded;
      data: MessageAddedData;
    }
  | {
      type: StarlightWebSocketResponseType.messageUpdated;
      data: MessageUpdatedData;
    }
  | {
      type: StarlightWebSocketResponseType.messageDeleted;
      data: MessageDeletedData;
    }
  | {
      type: StarlightWebSocketResponseType.audioCreated;
      data: AudioCreatedData;
    }
  | {
      type: StarlightWebSocketResponseType.voiceTranscriptionProcessed;
      data: VoiceTranscriptionProcessedData;
    }
  | {
      type: StarlightWebSocketResponseType.outOfCredits;
      data: OutOfCreditsData;
    }
  | { type: StarlightWebSocketResponseType.error; data: ErrorData };

// ** Data **
export type AuthSuccessData = {};

export type AdventureSuggestionsCreatedData = {
  suggestions: string[];
};

export type InstanceCreatedData = {
  instanceId: string;
};

export type MessageAddedData = {
  instanceId: string;
  message: Message;
};

export type MessageUpdatedData = {
  instanceId: string;
  message: Message;
};

export type MessageDeletedData = {
  instanceId: string;
  messageId: string;
};

export type AudioCreatedData = {
  audio: string; // base64 encoded audio
};

export type VoiceTranscriptionProcessedData = {
  transcription: string;
};

export type OutOfCreditsData = {};

export type ErrorData = {
  message: string;
};
