import { ServerWebSocket } from 'bun';
import { InstanceStage, MessageRole } from 'database';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { WebSocketData } from '../../src';
import { db } from '../../services/db';
import { stepInstanceUntil } from '../../core/instance/stateMachine';
import { sendToInstanceSubscribers, subscribeUserToInstance } from '../../src/connection';

export async function createInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstance) {
    throw new Error('Invalid request type for createInstanceHandler');
  }

  let initPrompt =
    "You are a master storyteller in charge of a text-adventure game. You have a wit as sharp as a dagger, and a heart as pure as gold. Your goal is to create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the player (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and we should match pacing accordingly, expanding on important sections, but keeping the story progressing at all times. When it's appropriate you can even imitate characters in the story for dialogue sections. Make sure to allow the player to make all the decisions, and do not condense the story too much. The player should feel like they are driving the story, and you are just the narrator. Favor bite-sized chunks of story that let the player make many small decisions rather than long monologues.";

  let initMessage = {
    content: initPrompt,
    role: MessageRole.system,
    name: 'system_prompt',
  };

  // TODO: how to best handle error handling outside of the state machine?
  let instance = await db.instance.create({
    data: {
      user: {
        connect: {
          id: ws.data.webSocketToken?.userId!,
        },
      },
      description: request.data.description,
      messages: {
        create: initMessage,
      },
      stage: InstanceStage.INIT_STORY_FINISH,
      locked: true,
      lockedAt: new Date(),
    },
    include: {
      messages: true,
    },
  });

  subscribeUserToInstance(ws.data.webSocketToken?.userId!, instance.id);

  await stepInstanceUntil(instance, InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH);

  await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      locked: false,
      lockedAt: null,
    },
  });

  sendToInstanceSubscribers(instance.id, {
    type: StarlightWebSocketResponseType.instanceLockStatusChanged,
    data: {
      instanceId: instance.id,
      locked: false,
    },
  });
}
