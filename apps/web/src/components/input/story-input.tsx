'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { Instance, InstanceStage, MessageRole } from 'database';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { ActionSuggestions } from './action-suggestions';
import { Icons } from '../icons';
import { Button, UndoButton, ShareButton, RetryButton, ProgressButton } from './buttons';
import { User } from 'next-auth';

interface StoryInputProps {
  user: User | undefined;
  instance: Instance & {
    players: {
      id: string;
    }[];
  };
  scrollRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export function StoryInput({ user, instance, scrollRef, className }: StoryInputProps) {
  const socketState = useWebsocketStore((state) => state.socketState);
  const sendToServer = useWebsocketStore((state) => state.sendToServer);

  const locked = useCurrentInstanceStore((state) => state.locked);
  const lockedAt = useCurrentInstanceStore((state) => state.lockedAt);
  const setLocked = useCurrentInstanceStore((state) => state.setLocked);
  const stage = useCurrentInstanceStore((state) => state.stage);

  const messages = useMessagesStore((state) => state.messages);
  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);

  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const [input, setInput] = useState('');

  const isOwner = user && instance && user.id === instance.userId;

  const submitAction = (action: string) => {
    if (!instance.id) return;

    setInput('');
    clearAudio();

    setSubmittedMessage(action);
    setCurrentStageText('Submitting action...');
    setCurrentStageIcon(<Icons.rocket />);
    setCurrentStageProgress(0);

    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }, 250);
    }

    sendToServer({
      type: StarlightWebSocketRequestType.addPlayerMessage,
      data: {
        instanceId: instance.id,
        message: action,
      },
    });

    setLocked(true);
  };

  const showSuggestions =
    submittedMessage == null &&
    messages.length > 0 &&
    messages[messages.length - 1].role == MessageRole.function &&
    messages[messages.length - 1].name == 'action_suggestions';
  const suggestions = showSuggestions ? JSON.parse(messages[messages.length - 1].content) : [];

  const error = locked && lockedAt && new Date().getTime() - new Date(lockedAt).getTime() > 60 * 1000 * 5;
  const errorText = typeof user !== 'undefined' ? 'Something went wrong. Please try again.' : 'You are observing this story.';

  const StageText = {
    [InstanceStage.INTRODUCE_STORY_START]: 'Introducing story...',
    [InstanceStage.ROLL_DICE_START]: 'Continuing story...',
    [InstanceStage.CREATE_IMAGE_START]: 'Creating image...',
    [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: 'Generating actions...',
    [InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH]: typeof user !== 'undefined' ? 'What do you do?' : `You are observing this story.`,
  };

  const StageIcons = {
    [InstanceStage.INTRODUCE_STORY_START]: <Icons.magicWand />,
    [InstanceStage.ROLL_DICE_START]: <Icons.magicWand />,
    [InstanceStage.CREATE_IMAGE_START]: <Icons.image />,
    [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: <Icons.lightning />,
  };

  const StageProgress = {
    [InstanceStage.INTRODUCE_STORY_START]: 0,
    [InstanceStage.CONTINUE_STORY_START]: 0,
    [InstanceStage.CREATE_IMAGE_START]: 0.5,
    [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: 0.75,
    [InstanceStage.GENERATE_ACTION_SUGGESTIONS_FINISH]: 1,
  };

  const [currentStageIcon, setCurrentStageIcon] = useState<JSX.Element>(
    StageIcons[instance.stage as keyof typeof StageIcons] || <Icons.magicWand />,
  );
  const [currentStageText, setCurrentStageText] = useState<string>(StageText[instance.stage as keyof typeof StageText] || 'Generating...');
  const [currentStageProgress, setCurrentStageProgress] = useState<number>(
    StageProgress[instance.stage as keyof typeof StageProgress] || 0,
  );

  useEffect(() => {
    if (instance) {
      setCurrentStageIcon(StageIcons[instance.stage as keyof typeof StageIcons] || <Icons.magicWand />);
      setCurrentStageText(StageText[instance.stage as keyof typeof StageText] || 'Generating...');
      setCurrentStageProgress(StageProgress[instance.stage as keyof typeof StageProgress] || 0);
    }
  }, [instance.id]);

  useEffect(() => {
    if (stage && StageIcons[stage as keyof typeof StageIcons]) {
      setCurrentStageIcon(StageIcons[stage as keyof typeof StageIcons]);
    }

    if (stage && StageText[stage as keyof typeof StageText]) {
      setCurrentStageText(StageText[stage as keyof typeof StageText]);
    }

    if (stage && StageProgress[stage as keyof typeof StageProgress]) {
      setCurrentStageProgress(StageProgress[stage as keyof typeof StageProgress]);
    }
  }, [stage]);

  return (
    <>
      <div
        className="absolute w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent bottom-10 blur-gradient"
        style={{ pointerEvents: 'none' }}
      />
      <div className="absolute w-full h-10 bg-neutral-950 bottom-0" style={{ pointerEvents: 'none' }} />
      <div className={cn(`story-input-wrapper absolute bottom-0 px-4 md:px-2 lg:px-0 pb-2 w-full max-w-3xl flex flex-col z-10`, className)}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn('flex flex-nowrap flex-row gap-x-2 gap-y-2 overflow-x-auto scrollbar-hide', className)}>
            {showSuggestions && socketState == 'open' && !locked && typeof user !== 'undefined' && (
              <ActionSuggestions suggestions={suggestions} submitAction={submitAction} />
            )}
          </div>
          <div className="hidden md:flex gap-x-2 items-center h-full">
            {error && typeof user !== 'undefined' && <RetryButton />}
            {messages.some((message) => message.role === MessageRole.user) && !locked && typeof user !== 'undefined' && !error && (
              <UndoButton className="fade-in-2s" />
            )}
            {isOwner && <ShareButton />}
          </div>
        </div>
        <div className="flex gap-x-2 items-center md:block">
          {socketState != 'open' ? (
            <Button disabled icon={<Icons.link />} className="md:hidden" />
          ) : (
            <>
              {typeof user !== 'undefined' && error && <RetryButton className="block md:hidden" />}
              {typeof user !== 'undefined' && !error && !locked && messages.some((message) => message.role === MessageRole.user) && (
                <UndoButton className="md:hidden" />
              )}

              {!error && locked && <ProgressButton icon={currentStageIcon} progress={currentStageProgress} className="md:hidden" />}
              {typeof user === 'undefined' && !error && !locked && <Button disabled icon={<Icons.eye />} className="md:hidden" />}
            </>
          )}
          <Input
            placeholder={error ? errorText : currentStageText}
            value={input}
            setValue={setInput}
            submit={() => submitAction(input)}
            disabled={locked || typeof user === 'undefined'}
          />
        </div>
      </div>
    </>
  );
}
