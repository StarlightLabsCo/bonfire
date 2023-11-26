import { Instance, InstanceStage, Message } from 'database';
import { createOutline } from './planning/outline';
import { introduceStory } from './narrator/introduction';
import { createImage } from './images';
import { generateActionSuggestions } from './suggestions/actions';
import { rollDice } from './dice/roll';
import { narratorReaction } from './narrator/reaction';
import { continueStory } from './narrator/continue';
import { db } from '../services/db';

export const InstanceFunctions = {
  // Introduction sequence
  [InstanceStage.INIT_STORY_FINISH]: createOutline,
  [InstanceStage.CREATE_OUTLINE_FINISH]: introduceStory,
  [InstanceStage.INTRODUCE_STORY_FINISH]: createImage,

  // Action sequence
  [InstanceStage.ADD_PLAYER_MESSAGE_FINISH]: rollDice,
  [InstanceStage.ROLL_DICE_FINISH]: narratorReaction,
  [InstanceStage.NARRATOR_REACTION_FINISH]: continueStory,
  [InstanceStage.CONTINUE_STORY_FINISH]: createImage,

  // Shared
  [InstanceStage.CREATE_IMAGE_FINISH]: generateActionSuggestions,

  // TODO: add proper error handling
  // Errors
  [InstanceStage.INIT_STORY_ERROR]: () => Promise.reject('Instance failed to initialize'),
  [InstanceStage.CREATE_OUTLINE_ERROR]: () => Promise.reject('Instance failed to create outline'),
  [InstanceStage.INTRODUCE_STORY_ERROR]: () => Promise.reject('Instance failed to introduce story'),
  [InstanceStage.ADD_PLAYER_MESSAGE_ERROR]: () => Promise.reject('Instance failed to add player message'),
  [InstanceStage.ROLL_DICE_ERROR]: () => Promise.reject('Instance failed to roll dice'),
  [InstanceStage.NARRATOR_REACTION_ERROR]: () => Promise.reject('Instance failed to react to player message'),
  [InstanceStage.CONTINUE_STORY_ERROR]: () => Promise.reject('Instance failed to continue story'),
  [InstanceStage.CREATE_IMAGE_ERROR]: () => Promise.reject('Instance failed to create image'),
};

export async function stepInstance(instance: Instance & { messages: Message[] }) {
  let updatedInstance: Instance & { messages: Message[] };
  try {
    const nextStep = InstanceFunctions[instance.stage as keyof typeof InstanceFunctions];
    if (!nextStep) {
      throw new Error(`Invalid instance stage: ${instance.stage}`);
    }

    updatedInstance = await nextStep(instance);
  } catch (error) {
    console.error(error);

    updatedInstance = await db.instance.update({
      where: {
        id: instance.id,
      },
      data: {
        stage: InstanceStage[(instance.stage + 1) as keyof typeof InstanceStage], // Switch from current stage to related error stage
      },
      include: {
        messages: true,
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
      throw new Error('Possible infinite loop detected');
    }

    updatedInstance = await stepInstance(updatedInstance);
    counter++;
  }

  return updatedInstance;
}
