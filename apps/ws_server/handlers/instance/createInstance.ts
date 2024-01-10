import { ServerWebSocket } from 'bun';
import { InstanceStage, MessageRole } from 'database';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, StarlightWebSocketResponseType } from 'websocket/types';
import { WebSocketData } from '../../src';
import { db } from '../../services/db';
import { stepInstanceUntil } from '../../core/instance/stateMachine';
import { sendToInstanceSubscribers, subscribeUserToInstance } from '../../src/connection';

const defaultNarrator =
  "You are a master storyteller in charge of a text-adventure game. Your goal is to create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the player (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and should match pacing accordingly. Expand on important sections, but keep the story progressing at all times. When it's appropriate you can imitate characters in the story for dialogue sections. Make sure to allow the player to make all the decisions, and do not condense the story. The player should feel like they are driving the story, and you are just the narrator. Favor bite-sized chunks of story that let the player make many small decisions rather than long monologues.";

export async function createInstanceHandler(ws: ServerWebSocket<WebSocketData>, request: StarlightWebSocketRequest) {
  if (request.type !== StarlightWebSocketRequestType.createInstance) {
    throw new Error('Invalid request type for createInstanceHandler');
  }

  let instance;
  if (request.data.instanceTemplateId) {
    console.log('[Debug] Creating instance from template id', request.data.instanceTemplateId);
    let instanceTemplate = await db.instanceTemplate.findUnique({
      where: {
        id: request.data.instanceTemplateId,
      },
    });

    if (!instanceTemplate) {
      throw new Error('Invalid instance template id');
    }

    await db.instanceTemplate.update({
      where: {
        id: instanceTemplate.id,
      },
      data: {
        plays: instanceTemplate.plays + 1,
      },
    });

    // Narrator Personality Prompt
    let initPrompt = instanceTemplate.narratorPersonality || defaultNarrator;

    let initMessage = {
      content: initPrompt,
      role: MessageRole.system,
      name: 'system_prompt',
    };

    instance = await db.instance.create({
      data: {
        user: {
          connect: {
            id: ws.data.webSocketToken?.userId!,
          },
        },
        template: {
          connect: {
            id: instanceTemplate.id,
          },
        },
        narratorVoiceId: instanceTemplate.narratorVoiceId,
        name: instanceTemplate.name,
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

    console.log('[Debug] Created instance', instance);

    subscribeUserToInstance(ws.data.webSocketToken?.userId!, instance.id);

    sendToInstanceSubscribers(instance.id, {
      type: StarlightWebSocketResponseType.instanceStageChanged,
      data: {
        instanceId: instance.id,
        stage: instance.stage,
      },
    });

    // Story Outline Prompt
    if (instanceTemplate.storyOutline) {
      let outlinePrompt = instanceTemplate.storyOutline;

      let outlineMessage = {
        content: outlinePrompt,
        role: MessageRole.system,
        name: 'story_outline',
      };

      instance = await db.instance.update({
        where: {
          id: instance.id,
        },
        data: {
          messages: {
            create: outlineMessage,
          },
          history: {
            push: [instance.stage, InstanceStage.CREATE_OUTLINE_START],
          },
          stage: InstanceStage.CREATE_OUTLINE_FINISH,
        },
        include: {
          messages: true,
        },
      });

      sendToInstanceSubscribers(instance.id, {
        type: StarlightWebSocketResponseType.instanceStageChanged,
        data: {
          instanceId: instance.id,
          stage: instance.stage,
        },
      });

      sendToInstanceSubscribers(instance.id, {
        type: StarlightWebSocketResponseType.instanceCreated,
        data: {
          instanceId: instance.id,
        },
      });
    }

    console.log(`[Debug] Stepping instance ${instance.id} to ${InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH}`);

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
        lockedAt: null,
      },
    });
  } else if (request.data.description) {
    console.log('[Debug] Creating instance from description', request.data.description);

    // Default Prompt
    let initPrompt = defaultNarrator;

    let initMessage = {
      content: initPrompt,
      role: MessageRole.system,
      name: 'system_prompt',
    };

    instance = await db.instance.create({
      data: {
        user: {
          connect: {
            id: ws.data.webSocketToken?.userId!,
          },
        },
        name: request.data.description,
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

    console.log('[Debug] Created instance', instance);

    subscribeUserToInstance(ws.data.webSocketToken?.userId!, instance.id);

    sendToInstanceSubscribers(instance.id, {
      type: StarlightWebSocketResponseType.instanceStageChanged,
      data: {
        instanceId: instance.id,
        stage: instance.stage,
      },
    });

    console.log(`[Debug] Stepping instance ${instance.id} to ${InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH}`);

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
        lockedAt: null,
      },
    });
  } else {
    console.error('Invalid request data for createInstanceHandler');
    throw new Error('Invalid request data for createInstanceHandler');
  }
}
