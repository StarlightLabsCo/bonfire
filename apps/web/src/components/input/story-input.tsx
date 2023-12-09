'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { UndoButton } from './undo-button';
import { ShareButton } from './share-button';
import { ActionSuggestion, StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { MessageRole } from 'database';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

interface StoryInputProps {
  instanceId: string;
  className?: string;
}

export function StoryInput({ instanceId, className }: StoryInputProps) {
  const isLocked = useCurrentInstanceStore((state) => state.locked);
  const setLocked = useCurrentInstanceStore((state) => state.setLocked);

  const [input, setInput] = useState('');

  const messages = useMessagesStore((state) => state.messages);
  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);

  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const showSuggestions =
    submittedMessage == null &&
    messages.length > 0 &&
    messages[messages.length - 1].role == MessageRole.function &&
    messages[messages.length - 1].name == 'action_suggestions';

  const submitAction = (action: string) => {
    if (!instanceId) return;

    setInput('');
    clearAudio();

    setSubmittedMessage(action);

    sendToServer({
      type: StarlightWebSocketRequestType.addPlayerMessage,
      data: {
        instanceId,
        message: action,
      },
    });

    setLocked(true);
  };

  return (
    <>
      <div className="absolute w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent bottom-10 blur-gradient" />
      <div className="absolute w-full h-10 bg-neutral-950 bottom-0" />
      <div
        className={cn(
          `story-input-wrapper absolute bottom-0 px-4 md:px-2 lg:px-0 pb-2 w-full max-w-3xl flex flex-col z-10`,
          className,
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={cn('flex flex-nowrap flex-row gap-x-2 gap-y-2 overflow-x-auto scrollbar-hide', className)}>
            {showSuggestions &&
              JSON.parse(messages[messages.length - 1].content).map((suggestion: ActionSuggestion, index: number) => (
                <button
                  key={index}
                  className="px-3 py-1 rounded-full border-[0.5px] border-white/20 hover:border-white/30 bg-neutral-950 text-white/50 hover:text-white/80 fade-in-2s whitespace-nowrap"
                  onClick={() => submitAction(suggestion.action)}
                >
                  <span className="text-xs md:text-sm font-light">{suggestion.action}</span>
                </button>
              ))}
          </div>
          <div className="flex gap-x-2 items-center h-full">
            <UndoButton />
            <ShareButton className="hidden md:block" />
          </div>
        </div>
        <Input
          placeholder="What do you do?"
          value={input}
          setValue={setInput}
          submit={() => submitAction(input)}
          disabled={isLocked}
        />
      </div>
    </>
  );
}
