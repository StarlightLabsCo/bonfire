import { z } from 'zod';
import * as Types from './types';
import { InstanceStage, Message, MessageRole } from '../database';

// ** --------------------------------- Message Schema --------------------------------- **
export const MessageRoleZodSchema: z.ZodType<MessageRole> = z.enum(['system', 'assistant', 'function', 'user']);

export const MessageZodSchema: z.ZodType<Message> = z
  .object({
    id: z.string(),
    instanceId: z.string(),

    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    role: MessageRoleZodSchema,
    content: z.string(),
    name: z.string().nullable(),
    function_call: z.string().nullable(),
  })
  .strict();

// ** --------------------------------- Websocket Request Zod Schemas --------------------------------- **
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
        narratorPrompt: z.string().nullable(),
        narratorVoiceId: z.string(),
        narratorResponseLength: z.number(),
        storyOutline: z.string().nullable(),
        description: z.string().nullable(),
        imageStyle: z.string().nullable(),
      })
      .strict(),
  })
  .strict();

export const SubscribeToInstanceRequestZodSchema: z.ZodType<Types.SubscribeToInstanceRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.subscribeToInstance),
    data: z
      .object({
        instanceId: z.string(),
      })
      .strict(),
  })
  .strict();

export const UnsuscribeFromInstanceRequestZodSchema: z.ZodType<Types.UnsuscribeFromInstanceRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.unsubscribeFromInstance),
    data: z
      .object({
        instanceId: z.string(),
      })
      .strict(),
  })
  .strict();

export const ResumeInstanceRequestZodSchema: z.ZodType<Types.ResumeInstanceRequest> = z
  .object({
    type: z.literal(Types.StarlightWebSocketRequestType.resumeInstance),
    data: z
      .object({
        instanceId: z.string(),
      })
      .strict(),
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

export const InstanceLockStatusChangedResponseZodSchema: z.ZodType<Types.InstanceLockStatusChangedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.instanceLockStatusChanged),
    data: z
      .object({
        instanceId: z.string(),
        locked: z.boolean(),
        lockedAt: z.coerce.date().nullable(),
      })
      .strict(),
  })
  .strict();

export const InstanceSubscriptionStatusResponseZodSchema: z.ZodType<Types.InstanceSubscriptionStatusResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.instanceSubscriptionStatus),
    data: z
      .object({
        instanceId: z.string(),
        subscribed: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const InstanceConnectedUserZodSchema: z.ZodType<Types.InstanceConnectedUser> = z
  .object({
    id: z.string(),
    name: z.string().nullable(),
    image: z.string().nullable(),
  })
  .strict();

export const InstanceConnectedUsersStatusResponseZodSchema: z.ZodType<Types.InstanceConnectedUsersStatusResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.instanceConnectedUsersStatus),
    data: z
      .object({
        instanceId: z.string(),
        registeredUsers: z.array(InstanceConnectedUserZodSchema),
        anonymousUsers: z.number(),
      })
      .strict(),
  })
  .strict();

export const InstanceStageChangedResponseZodSchema: z.ZodType<Types.InstanceStageChangedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.instanceStageChanged),
    data: z
      .object({
        instanceId: z.string(),
        stage: z.nativeEnum(InstanceStage),
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

export const MessageReplaceResponseZodSchema: z.ZodType<Types.MessageReplaceResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.messageReplace),
    data: z
      .object({
        instanceId: z.string(),
        messageId: z.string(),
        content: z.string(),
      })
      .strict(),
  })
  .strict();

export const MessageUpsertResponseZodSchema: z.ZodType<Types.MessageUpsertResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.messageUpsert),
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
        audio: z.string().nullable(), // base64 encoded audio or null (only on end)
        start: z.boolean(),
        end: z.boolean(),
      })
      .strict(),
  })
  .strict();

export const AudioTimingsSchema: z.ZodType<Types.AudioWordTimings> = z
  .object({
    words: z.array(z.string()),
    wordStartTimesMs: z.array(z.number()),
    wordDurationsMs: z.array(z.number()),
  })
  .strict();

export const AudioTimingsCreatedResponseZodSchema: z.ZodType<Types.AudioTimingsCreatedResponse> = z
  .object({
    type: z.literal(Types.StarlightWebSocketResponseType.audioTimingsCreated),
    data: z
      .object({
        timings: AudioTimingsSchema,
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
  [Types.StarlightWebSocketRequestType.createAdventureSuggestions]: CreateAdventureSuggestionsRequestZodSchema,
  [Types.StarlightWebSocketRequestType.createInstance]: CreateInstanceRequestZodSchema,
  [Types.StarlightWebSocketRequestType.subscribeToInstance]: SubscribeToInstanceRequestZodSchema,
  [Types.StarlightWebSocketRequestType.unsubscribeFromInstance]: UnsuscribeFromInstanceRequestZodSchema,
  [Types.StarlightWebSocketRequestType.resumeInstance]: ResumeInstanceRequestZodSchema,
  [Types.StarlightWebSocketRequestType.addPlayerMessage]: AddPlayerMessageRequestZodSchema,
  [Types.StarlightWebSocketRequestType.undoMessage]: UndoMessageRequestZodSchema,
  [Types.StarlightWebSocketRequestType.heartbeatClientRequest]: HeartbeatClientRequestZodSchema,
  [Types.StarlightWebSocketRequestType.heartbeatClientResponse]: HeartbeatClientResponseZodSchema,
};

export const responseTypeToSchema: {
  [key in Types.StarlightWebSocketResponseType]: z.ZodSchema<Types.GenericStarlightWebSocketResponse<key, any>>;
} = {
  [Types.StarlightWebSocketResponseType.adventureSuggestionsCreated]: AdventureSuggestionsCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceCreated]: InstanceCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceLockStatusChanged]: InstanceLockStatusChangedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceConnectedUsersStatus]: InstanceConnectedUsersStatusResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceSubscriptionStatus]: InstanceSubscriptionStatusResponseZodSchema,
  [Types.StarlightWebSocketResponseType.instanceStageChanged]: InstanceStageChangedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageAdded]: MessageAddedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageReplace]: MessageReplaceResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageUpsert]: MessageUpsertResponseZodSchema,
  [Types.StarlightWebSocketResponseType.messageDeleted]: MessageDeletedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.audioCreated]: AudioCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.audioTimingsCreated]: AudioTimingsCreatedResponseZodSchema,
  [Types.StarlightWebSocketResponseType.outOfCredits]: OutOfCreditsResponseZodSchema,
  [Types.StarlightWebSocketResponseType.error]: ErrorResponseZodSchema,
  [Types.StarlightWebSocketResponseType.heartbeatServerRequest]: HeartbeatServerRequestZodSchema,
  [Types.StarlightWebSocketResponseType.heartbeatServerResponse]: HeartbeatServerResponseZodSchema,
};

// ** --------------------------------- Inter Replica Message Zod Schema --------------------------------- **
const AllResponsesZodSchema = z.union([
  AdventureSuggestionsCreatedResponseZodSchema,
  InstanceCreatedResponseZodSchema,
  InstanceLockStatusChangedResponseZodSchema,
  InstanceSubscriptionStatusResponseZodSchema,
  InstanceConnectedUsersStatusResponseZodSchema,
  InstanceStageChangedResponseZodSchema,
  MessageAddedResponseZodSchema,
  MessageReplaceResponseZodSchema,
  MessageUpsertResponseZodSchema,
  MessageDeletedResponseZodSchema,
  AudioCreatedResponseZodSchema,
  AudioTimingsCreatedResponseZodSchema,
  OutOfCreditsResponseZodSchema,
  ErrorResponseZodSchema,
  HeartbeatServerRequestZodSchema,
  HeartbeatServerResponseZodSchema,
]);

export const InterReplicaMessageZodSchema: z.ZodType<Types.InterReplicaMessage> = z
  .object({
    connectionId: z.string(),
    data: AllResponsesZodSchema,
  })
  .strict();
