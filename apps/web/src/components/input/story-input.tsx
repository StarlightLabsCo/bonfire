'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { ActionSuggestions } from './action-suggestions';
import { UndoButton } from './undo-button';
import { useWebSocket } from '../contexts/ws-context';
import { useMessages } from '../contexts/messages-context';
import { ShareButton } from './share-button';
import { StarlightWebSocketRequestType } from 'websocket';
import { useShareDialogStore } from '@/stores/share-dialog-store';

interface StoryInputProps {
  instanceId: string;
  className?: string;
}

export function StoryInput({ instanceId, className }: StoryInputProps) {
  const [input, setInput] = useState('');
  const { sendToServer } = useWebSocket();
  const { messages, setMessages } = useMessages();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { setIsDialogOpen } = useShareDialogStore();

  const submit = () => {
    sendToServer({
      type: StarlightWebSocketRequestType.addPlayerMessage,
      data: {
        instanceId,
        message: input,
      },
    });

    setMessages([...messages, { id: Date.now().toString(), role: 'user', content: input }]);

    setInput('');
    setSuggestions([]);
  };

  return (
    <>
      <div className={cn(`flex flex-col w-full mt-2`, className)}>
        <div className="flex items-center justify-between mb-2">
          <ActionSuggestions suggestions={suggestions} setSuggestions={setSuggestions} className="text-xs " />
          <div className="flex gap-x-2 items-center h-full">
            <UndoButton />
            <ShareButton className="hidden md:block" onClick={() => setIsDialogOpen(true)} />
          </div>
        </div>
        <Input placeholder="What do you do?" value={input} setValue={setInput} submit={submit} />
      </div>
    </>
  );
}
