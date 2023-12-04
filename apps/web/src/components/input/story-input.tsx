'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { ActionSuggestions } from './action-suggestions';
import { UndoButton } from './undo-button';
import { ShareButton } from './share-button';
import { StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useMessagesStore } from '@/stores/messages-store';
import { useDialogStore } from '@/stores/dialog-store';

interface StoryInputProps {
  instanceId: string;
  className?: string;
}

export function StoryInput({ instanceId, className }: StoryInputProps) {
  const [input, setInput] = useState('');

  const sendToServer = useWebsocketStore((state) => state.sendToServer);

  const setIsShareDialogOpen = useDialogStore((state) => state.setIsShareDialogOpen);

  const submit = () => {
    sendToServer({
      type: StarlightWebSocketRequestType.addPlayerMessage,
      data: {
        instanceId,
        message: input,
      },
    });

    setInput('');
  };

  return (
    <>
      <div className={cn(`flex flex-col w-full px-8 mt-2`, className)}>
        <div className="flex items-center justify-between mb-2">
          <ActionSuggestions className="text-xs" />
          <div className="flex gap-x-2 items-center h-full">
            {/* <UndoButton /> */}
            <ShareButton className="hidden md:block" onClick={() => setIsShareDialogOpen(true)} />
          </div>
        </div>
        <Input placeholder="What do you do?" value={input} setValue={setInput} submit={submit} />
      </div>
    </>
  );
}
