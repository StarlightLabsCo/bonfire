import { Instance, InstanceStage, Message } from 'database';
import { db } from '../services/db';

import { introduceStory } from './instance/introduction/introduction';
import { createOutline, retryCreateOutline } from './instance/introduction/outline';

import { rollDice } from './instance/continue/dice';
import { narratorReaction } from './instance/continue/reaction';
import { narratorPlanning } from './instance/continue/planning';
import { continueStory } from './instance/continue/continue';

import { createImage } from './instance/images';
import { generateActionSuggestions } from './instance/actions';

export const InstanceFunctions = {
  // Introduction sequence
  [InstanceStage.INIT_STORY_FINISH]: createOutline,
  [InstanceStage.CREATE_OUTLINE_FINISH]: introduceStory,
  [InstanceStage.INTRODUCE_STORY_FINISH]: createImage,

  // Action sequence
  [InstanceStage.ADD_PLAYER_MESSAGE_FINISH]: rollDice,
  [InstanceStage.ROLL_DICE_FINISH]: narratorReaction,
  [InstanceStage.NARRATOR_REACTION_FINISH]: narratorPlanning,
  [InstanceStage.NARRATOR_PLANNING_FINISH]: continueStory,
  [InstanceStage.CONTINUE_STORY_FINISH]: createImage,

  // Shared
  [InstanceStage.CREATE_IMAGE_FINISH]: generateActionSuggestions,

  // TODO: add proper error handling
  // Errors
  // [InstanceStage.INIT_STORY_ERROR]: () => Promise.reject('Instance failed to initialize'),
  [InstanceStage.CREATE_OUTLINE_ERROR]: retryCreateOutline,
  // [InstanceStage.INTRODUCE_STORY_ERROR]: () => Promise.reject('Instance failed to introduce story'),
  // [InstanceStage.ADD_PLAYER_MESSAGE_ERROR]: () => Promise.reject('Instance failed to add player message'),
  // [InstanceStage.ROLL_DICE_ERROR]: () => Promise.reject('Instance failed to roll dice'),
  // [InstanceStage.NARRATOR_REACTION_ERROR]: () => Promise.reject('Instance failed to react to player message'),
  // [InstanceStage.CONTINUE_STORY_ERROR]: () => Promise.reject('Instance failed to continue story'),
  // [InstanceStage.CREATE_IMAGE_ERROR]: () => Promise.reject('Instance failed to create image'),
};

export async function stepInstance(instance: Instance & { messages: Message[] }) {
  let updatedInstance: Instance & { messages: Message[] };
  try {
    const nextStep = InstanceFunctions[instance.stage as keyof typeof InstanceFunctions];
    if (!nextStep) {
      throw new Error(`No function founder for: ${instance.stage}`);
    }

    console.log(
      `[${Date.now()}][State Machine][Instance: ${instance.id}] ${instance.stage} ---executing---> ${nextStep.name}`,
    );

    updatedInstance = await nextStep(instance);
  } catch (error) {
    console.error(error);

    updatedInstance = await db.instance.update({
      where: {
        id: instance.id,
      },
      data: {
        stage: InstanceStage[(instance.stage + 1) as keyof typeof InstanceStage], // Switch from current stage to related error stage
        error: error as string,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  return updatedInstance;
}

export async function stepInstanceUntil(instance: Instance & { messages: Message[] }, endStage: InstanceStage) {
  let counter = 0;
  const MAX_ITERATIONS = 10;

  let updatedInstance = instance;
  while (updatedInstance.stage !== endStage) {
    if (counter > MAX_ITERATIONS) {
      throw new Error('Possible infinite loop detected'); // TODO: add recovery here
    }

    updatedInstance = await stepInstance(updatedInstance);
    counter++;
  }

  return updatedInstance;
}
