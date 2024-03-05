'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { MessageRole } from 'database';
import { ActionSuggestions } from './action-suggestions';
import { Icons } from '../icons';
import { Button, UndoButton } from './buttons';

interface StoryInputProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  text: string;
  className?: string;
}

export function ExampleStoryInput({ scrollRef, text, className }: StoryInputProps) {
  const messages = useMessagesStore((state) => state.messages);
  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);

  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const [input, setInput] = useState('');

  const submitAction = (action: string) => {
    setInput('');
    clearAudio();

    setSubmittedMessage(action);

    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }, 250);
    }
  };

  const showSuggestions =
    submittedMessage == null &&
    messages.length > 0 &&
    messages[messages.length - 1].role == MessageRole.function &&
    messages[messages.length - 1].name == 'action_suggestions';
  const suggestions = showSuggestions ? JSON.parse(messages[messages.length - 1].content) : [];

  return (
    <>
      <div
        className="absolute w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent bottom-10 blur-gradient"
        style={{ pointerEvents: 'none' }}
      />
      <div className="absolute bottom-0 w-full h-10 bg-neutral-950" style={{ pointerEvents: 'none' }} />
      <div className={cn(`story-input-wrapper absolute bottom-0 px-4 md:px-2 lg:px-0 pb-2 w-full max-w-3xl flex flex-col z-10`, className)}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn('flex flex-nowrap flex-row gap-x-2 gap-y-2 overflow-x-auto scrollbar-hide', className)}>
            {showSuggestions && <ActionSuggestions suggestions={suggestions} submitAction={submitAction} />}
          </div>
          <div className="items-center hidden h-full md:flex gap-x-2">
            {messages.some((message) => message.role === MessageRole.user) && <UndoButton className="fade-in-2s" />}
          </div>
        </div>
        <div className="flex items-center gap-x-2 md:block">
          <Button disabled icon={<Icons.link />} className="md:hidden" />
          <Input placeholder={text} value={input} setValue={setInput} submit={() => submitAction(input)} disabled={true} />
        </div>
      </div>
    </>
  );
}
