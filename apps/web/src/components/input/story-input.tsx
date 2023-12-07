'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { UndoButton } from './undo-button';
import { ShareButton } from './share-button';
import { ActionSuggestion, StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { MessageRole } from 'database';

interface StoryInputProps {
  instanceId: string;
  className?: string;
}

export function StoryInput({ instanceId, className }: StoryInputProps) {
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
  };

  return (
    <>
      <div className={cn(`flex flex-col w-full px-8 mt-2`, className)}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn('flex flex-nowrap flex-row gap-x-2 gap-y-2 overflow-auto', className)}>
            {showSuggestions &&
              JSON.parse(messages[messages.length - 1].content).map((suggestion: ActionSuggestion, index: number) => (
                <button
                  key={index}
                  className="px-3 py-1 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s"
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
        <Input placeholder="What do you do?" value={input} setValue={setInput} submit={() => submitAction(input)} />
      </div>
    </>
  );
}
