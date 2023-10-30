import { z } from 'zod';
import * as Types from './types';
import { Message, MessageRole } from '../database';

// ** --------------------------------- Message Schema --------------------------------- **
export const MessageRoleZodSchema: z.ZodType<MessageRole> = z.enum(['system', 'assistant', 'function', 'user']);

export const MessageZodSchema: z.ZodType<Message> = z
  .object({
    id: z.string(),
    instanceId: z.string(),
    embedding: z.union([z.array(z.number()), z.null()]),
    importance: z.union([z.number(), z.null()]),
    accessedAt: z.union([z.date(), z.null()]),
    createdAt: z.date(),
    updatedAt: z.date(),

    role: MessageRoleZodSchema,
    content: z.string(),
    name: z.union([z.string(), z.null()]),
    functionCall: z.union([z.string(), z.null()]),
  })
  .strict();

// ** --------------------------------- Websocket Request Zod Schemas --------------------------------- **
export const AuthRequestZodSchema: z.ZodType<Types.AuthRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.auth),
    data: z
      .object({
        token: z.string(),
        connectionId: z.string(),
      })
      .strict(),
  })
  .strict();

export const CreateAdventureSuggestionsRequestZodSchema: z.ZodType<Types.CreateAdventureSuggestionsRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.createAdventureSuggestions),
    data: z.object({}).strict(),
  })
  .strict();

export const CreateInstanceRequestZodSchema: z.ZodType<Types.CreateInstanceRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.createInstance),
    data: z
      .object({
        description: z.string(),
      })
      .strict(),
  })
  .strict();

export const CreateWelcomeSoundbiteRequestZodSchema: z.ZodType<Types.CreateWelcomeSoundbiteRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.createWelcomeSoundbite),
    data: z.object({}).strict(),
  })
  .strict();

export const AddPlayerMessageRequestZodSchema: z.ZodType<Types.AddPlayerMessageRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.addPlayerMessage),
    data: z
      .object({
        instanceId: z.string(),
        message: z.string(),
      })
      .strict(),
  })
  .strict();

export const UndoMessageRequestZodSchema: z.ZodType<Types.UndoMessageRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.undoMessage),
    data: z
      .object({
        instanceId: z.string(),
      })
      .strict(),
  })
  .strict();

export const StopAudioRequestZodSchema: z.ZodType<Types.StopAudioRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.stopAudio),
    data: z.object({}).strict(),
  })
  .strict();

export const ProcessVoiceTranscriptionRequestZodSchema: z.ZodType<Types.ProcessVoiceTranscriptionRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.processVoiceTranscription),
    data: z
      .object({
        audio: z.string(), // base64 encoded audio
      })
      .strict(),
  })
  .strict();

export const HeartbeatClientRequestZodSchema: z.ZodType<Types.HeartbeatClientRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.heartbeatClientRequest),
    data: z
      .object({
        timestamp: z.number(),
      })
      .strict(),
  })
  .strict();

export const HeartbeatClientResponseZodSchema: z.ZodType<Types.HeartbeatClientResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.heartbeatClientResponse),
    data: z
      .object({
        timestamp: z.number(),
        receivedTimestamp: z.number(),
      })
      .strict(),
  })
  .strict();

// ** --------------------------------- Websocket Response Zod Schemas --------------------------------- **
export const AuthSuccessResponseZodSchema: z.ZodType<Types.AuthSuccessResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.authSuccess),
    data: z.object({}).strict(),
  })
  .strict();

export const AdventureSuggestionsCreatedResponseZodSchema: z.ZodType<Types.AdventureSuggestionsCreatedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.adventureSuggestionsCreated),
    data: z
      .object({
        suggestions: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export const InstanceCreatedResponseZodSchema: z.ZodType<Types.InstanceCreatedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.instanceCreated),
    data: z
      .object({
        instanceId: z.string(),
      })
      .strict(),
  })
  .strict();

export const MessageAddedResponseZodSchema: z.ZodType<Types.MessageAddedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.messageAdded),
    data: z
      .object({
        instanceId: z.string(),
        message: MessageZodSchema,
      })
      .strict(),
  })
  .strict();

export const MessageUpdatedResponseZodSchema: z.ZodType<Types.MessageUpdatedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.messageUpdated),
    data: z
      .object({
        instanceId: z.string(),
        message: MessageZodSchema,
      })
      .strict(),
  })
  .strict();

export const MessageDeletedResponseZodSchema: z.ZodType<Types.MessageDeletedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.messageDeleted),
    data: z
      .object({
        instanceId: z.string(),
        messageId: z.string(),
      })
      .strict(),
  })
  .strict();

export const AudioCreatedResponseZodSchema: z.ZodType<Types.AudioCreatedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.audioCreated),
    data: z
      .object({
        audio: z.string(), // base64 encoded audio
      })
      .strict(),
  })
  .strict();

export const VoiceTranscriptionProcessedResponseZodSchema: z.ZodType<Types.VoiceTranscriptionProcessedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.voiceTranscriptionProcessed),
    data: z
      .object({
        transcription: z.string(),
      })
      .strict(),
  })
  .strict();

export const OutOfCreditsResponseZodSchema: z.ZodType<Types.OutOfCreditsResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.outOfCredits),
    data: z.object({}).strict(),
  })
  .strict();

export const ErrorResponseZodSchema: z.ZodType<Types.ErrorResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.error),
    data: z
      .object({
        message: z.string(),
      })
      .strict(),
  })
  .strict();

export const HeartbeatServerRequestZodSchema: z.ZodType<Types.HeartbeatServerRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.heartbeatServerRequest),
    data: z
      .object({
        timestamp: z.number(),
      })
      .strict(),
  })
  .strict();

export const HeartbeatServerResponseZodSchema: z.ZodType<Types.HeartbeatServerResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.heartbeatServerResponse),
    data: z
      .object({
        timestamp: z.number(),
        receivedTimestamp: z.number(),
      })
      .strict(),
  })
  .strict();

// ** --------------------------------- Websocket Type to Schema Map --------------------------------- **
export const requestTypeToSchema: {
  [key in Types.StarlightWebSocketRequestType]: z.ZodSchema<Types.GenericStarlightWebSocketRequest<key, any>>;
} = {
  [Types.StarlightWebSocketRequestType.auth]: AuthRequestZodSchema,
  [Types.StarlightWebSocketRequestType.createAdventureSuggestions]: CreateAdventureSuggestionsRequestZodSchema,
  [Types.StarlightWebSocketRequestType.createInstance]: CreateInstanceRequestZodSchema,
  [Types.StarlightWebSocketRequestType.createWelcomeSoundbite]: CreateWelcomeSoundbiteRequestZodSchema,
  [Types.StarlightWebSocketRequestType.addPlayerMessage]: AddPlayerMessageRequestZodSchema,
  [Types.StarlightWebSocketRequestType.undoMessage]: UndoMessageRequestZodSchema,
  [Types.StarlightWebSocketRequestType.stopAudio]: StopAudioRequestZodSchema,
  [Types.StarlightWebSocketRequestType.processVoiceTranscription]: ProcessVoiceTranscriptionRequestZodSchema,
  [Types.StarlightWebSocketRequestType.heartbeatClientRequest]: HeartbeatClientRequestZodSchema,
  [Types.StarlightWebSocketRequestType.heartbeatClientResponse]: HeartbeatClientResponseZodSchema,
};

export const responseTypeToSchema: {
  [key in Types.StarlightWebSocketResponseType]: z.ZodSchema<Types.GenericStarlightWebSocketResponse<key, any>>;
} = {
  [Types.StarlightWebSocketResponseType.authSuccess]: AuthSuccessResponseZodSchema,
  [Types.StarlightWebSocketResponseType.adventureSuggestionsCreated]: AdventureSuggestionsCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceCreated]: InstanceCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageAdded]: MessageAddedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageUpdated]: MessageUpdatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageDeleted]: MessageDeletedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.audioCreated]: AudioCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.voiceTranscriptionProcessed]: VoiceTranscriptionProcessedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.outOfCredits]: OutOfCreditsResponseZodSchema,
  [Types.StarlightWebSocketResponseType.error]: ErrorResponseZodSchema,
  [Types.StarlightWebSocketResponseType.heartbeatServerRequest]: HeartbeatServerRequestZodSchema,
  [Types.StarlightWebSocketResponseType.heartbeatServerResponse]: HeartbeatServerResponseZodSchema,
};
