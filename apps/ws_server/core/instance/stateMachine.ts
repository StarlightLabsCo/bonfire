import OpenAI from 'openai';
import { Instance, InstanceStage, Message, Prisma } from 'database';
import { db } from '../../services/db';

import { introduceStory, resetIntroduceStory } from './introduction/introduction';
import { createOutline, resetCreateOutline } from './introduction/outline';

import { resetRollDice, rollDice } from './continue/dice';
import { narratorReaction, resetNarratorReaction } from './continue/reaction';
import { narratorPlanning, resetNarratorPlanning } from './continue/planning';
import { continueStory, resetContinueStory } from './continue/continue';

import { createImage, resetCreateImage } from './images';
import { generateActionSuggestions, resetActionSuggestions } from './actions';

export const InstanceStageTransitions = {
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

  // Errors
  [InstanceStage.CREATE_OUTLINE_START]: transitionToErrorState, // Server closed unexpectedly,
  [InstanceStage.CREATE_OUTLINE_ERROR]: resetCreateOutline, // If in error state, reset and try again

  [InstanceStage.INTRODUCE_STORY_START]: transitionToErrorState,
  [InstanceStage.INTRODUCE_STORY_ERROR]: resetIntroduceStory,

  [InstanceStage.ROLL_DICE_START]: transitionToErrorState,
  [InstanceStage.ROLL_DICE_ERROR]: resetRollDice,

  [InstanceStage.NARRATOR_REACTION_START]: transitionToErrorState,
  [InstanceStage.NARRATOR_REACTION_ERROR]: resetNarratorReaction,

  [InstanceStage.NARRATOR_PLANNING_START]: transitionToErrorState,
  [InstanceStage.NARRATOR_PLANNING_ERROR]: resetNarratorPlanning,

  [InstanceStage.CONTINUE_STORY_START]: transitionToErrorState,
  [InstanceStage.CONTINUE_STORY_ERROR]: resetContinueStory,

  [InstanceStage.CREATE_IMAGE_START]: transitionToErrorState,
  [InstanceStage.CREATE_IMAGE_ERROR]: resetCreateImage,

  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: transitionToErrorState,
  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_ERROR]: resetActionSuggestions,
};

export const InstanceStageToError = {
  // Introduction sequence
  [InstanceStage.CREATE_OUTLINE_START]: InstanceStage.CREATE_OUTLINE_ERROR,
  [InstanceStage.INTRODUCE_STORY_START]: InstanceStage.INTRODUCE_STORY_ERROR,

  // Action sequence
  [InstanceStage.ROLL_DICE_START]: InstanceStage.ROLL_DICE_ERROR,
  [InstanceStage.NARRATOR_REACTION_START]: InstanceStage.NARRATOR_REACTION_ERROR,
  [InstanceStage.NARRATOR_PLANNING_START]: InstanceStage.NARRATOR_PLANNING_ERROR,
  [InstanceStage.CONTINUE_STORY_START]: InstanceStage.CONTINUE_STORY_ERROR,

  // Shared
  [InstanceStage.CREATE_IMAGE_START]: InstanceStage.CREATE_IMAGE_ERROR,
  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: InstanceStage.GENERATE_ACTION_SUGGESTIONS_ERROR,

  // Database couldn't transition to start state (try again)
  [InstanceStage.CREATE_OUTLINE_FINISH]: InstanceStage.CREATE_OUTLINE_FINISH,
  [InstanceStage.INTRODUCE_STORY_FINISH]: InstanceStage.INTRODUCE_STORY_FINISH,
  [InstanceStage.CREATE_IMAGE_FINISH]: InstanceStage.CREATE_IMAGE_FINISH,
  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH]: InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH,

  [InstanceStage.ADD_PLAYER_MESSAGE_FINISH]: InstanceStage.ADD_PLAYER_MESSAGE_FINISH,
  [InstanceStage.ROLL_DICE_FINISH]: InstanceStage.ROLL_DICE_FINISH,
  [InstanceStage.NARRATOR_REACTION_FINISH]: InstanceStage.NARRATOR_REACTION_FINISH,
  [InstanceStage.NARRATOR_PLANNING_FINISH]: InstanceStage.NARRATOR_PLANNING_FINISH,
  [InstanceStage.CONTINUE_STORY_FINISH]: InstanceStage.CONTINUE_STORY_FINISH,
};

async function transitionToErrorState(instance: Instance & { messages: Message[] }) {
  let updatedInstance = await db.instance.update({
    where: {
      id: instance.id,
    },
    data: {
      history: {
        push: instance.stage,
      },
      stage: InstanceStageToError[instance.stage as keyof typeof InstanceStageToError],
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return updatedInstance;
}

export async function stepInstance(instance: Instance & { messages: Message[] }) {
  let updatedInstance: Instance & { messages: Message[] };
  try {
    const nextStep = InstanceStageTransitions[instance.stage as keyof typeof InstanceStageTransitions];
    if (!nextStep) {
      throw new Error(`No function found for: ${instance.stage}`);
    }

    console.log(`[${Date.now()}][State Machine][Instance: ${instance.id}] ${instance.stage} ---executing---> ${nextStep.name}`);

    updatedInstance = await nextStep(instance);
  } catch (error) {
    console.error(`[StateMachine] Error: `, error);

    let errorMessage: string;
    if (error instanceof OpenAI.APIError) {
      errorMessage = 'OpenAI [' + error.status + ']: ' + error.message;
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      errorMessage = `Prisma [` + error.code + `]: ` + error.message;
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      errorMessage = error.message;
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      errorMessage = error.message;
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      errorMessage = error.message;
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      // Handle all other errors
      console.error(`[StateMachine] Unhandled error: `, error);
      errorMessage = 'Unhandled error';
    }

    await db.instance.update({
      where: {
        id: instance.id,
      },
      data: {
        error: errorMessage,
      },
    });

    updatedInstance = await transitionToErrorState(instance);
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
