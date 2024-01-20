import { InterReplicaMessageZodSchema, requestTypeToSchema, responseTypeToSchema } from 'websocket/schema';
import {
  InterReplicaMessage,
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponse,
  StarlightWebSocketResponseType,
} from 'websocket/types';

export function validateRequest(message: string | Buffer) {
  const rawRequest = JSON.parse(message.toString());

  if (!(rawRequest.type in StarlightWebSocketRequestType)) {
    console.error('Invalid request type:', rawRequest.type);
    return;
  }

  const schema = requestTypeToSchema[rawRequest.type as keyof typeof requestTypeToSchema];

  if (!schema) {
    console.error('No schema found for ' + rawRequest.type);
    return;
  }

  const result = schema.safeParse(rawRequest);

  if (!result.success) {
    console.error('Invalid request data:', result.error);
    return;
  }

  return result.data as StarlightWebSocketRequest;
}

export function validateResponse(message: string | Buffer) {
  const rawResponse = JSON.parse(message.toString());

  if (!(rawResponse.type in StarlightWebSocketResponseType)) {
    console.error('Invalid response type:', rawResponse.type);
    return;
  }

  const schema = responseTypeToSchema[rawResponse.type as keyof typeof responseTypeToSchema];

  if (!schema) {
    console.error('No schema found for ' + rawResponse.type);
    return;
  }

  const result = schema.safeParse(rawResponse);

  if (!result.success) {
    console.error('Invalid response data:', result.error);
    return;
  }

  return result.data as StarlightWebSocketResponse;
}

export function validateInterReplicaMessage(message: string | Buffer) {
  const rawMessage = JSON.parse(message.toString());

  const result = InterReplicaMessageZodSchema.safeParse(rawMessage);

  if (!result.success) {
    console.error('Invalid message data:', result.error);
    return;
  }

  return result.data as InterReplicaMessage;
}
