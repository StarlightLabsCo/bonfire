import { ServerWebSocket } from 'bun';
import { WebSocketData } from '../../src';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType } from 'websocket/types';
import { db } from '../../services/db';

export async function createInstanceTemplateHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstanceTemplate) {
    throw new Error('Invalid request type for createInstanceTemplateHandler');
  }

  const { name, description, imageURL, narratorVoiceId, narratorPersonality, storyOutline, imageStyle } = request.data;

  const instanceTemplate = await db.instanceTemplate.create({
    data: {
      name,
      description,
      imageURL,
      narratorVoiceId,
      narratorPersonality,
      storyOutline,
      imageStyle,
      user: {
        connect: {
          id: ws.data.webSocketToken?.userId!,
        },
      },
    },
  });

  console.log('[Debug] Created instance template', instanceTemplate);
}
