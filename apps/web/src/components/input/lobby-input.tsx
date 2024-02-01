'use client';

import { useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useAdventureSuggestionsStore } from '@/stores/adventure-suggestions-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useLobbyStore } from '@/stores/lobby-store';

interface LobbyInputProps {
  submitted: boolean;
  setSubmitted?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export function LobbyInput({ submitted, setSubmitted, className }: LobbyInputProps) {
  const socketState = useWebsocketStore((state) => state.socketState);
  const authenticated = useWebsocketStore((state) => state.authenticated);
  const sendToServer = useWebsocketStore((state) => state.sendToServer);

  const description = useLobbyStore((state) => state.description);
  const setDescription = useLobbyStore((state) => state.setDescription);

  const adventureSuggestions = useAdventureSuggestionsStore((state) => state.adventureSuggestions);

  const createInstance = useLobbyStore((state) => state.createInstance);

  const submit = (description: string) => {
    setSubmitted && setSubmitted(true);
    createInstance(description);
  };

  useEffect(() => {
    if (socketState == 'open' && authenticated && adventureSuggestions.length == 0) {
      setTimeout(() => {
        sendToServer({
          type: StarlightWebSocketRequestType.createAdventureSuggestions,
          data: {},
        });
      }, 1000);
    }
  }, [adventureSuggestions, authenticated, sendToServer, socketState]);

  return (
    <div className={cn(`flex flex-col items-center gap-y-2 w-full max-w-5xl mt-10`, className)}>
      <Input
        value={description || ''}
        setValue={setDescription}
        submit={() => submit(description)}
        placeholder="Describe your adventure..."
        disabled={submitted}
        className={cn(submitted && 'cursor-not-allowed fade-out-2s')}
      />
      <div className={cn('flex flex-row justify-center flex-wrap gap-x-2 gap-y-2 h-10', submitted && 'fade-out-2s')}>
        {adventureSuggestions &&
          adventureSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="px-3 py-1 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s bg-neutral-950"
              onClick={() => submit(suggestion)}
            >
              <span className="text-xs md:text-sm font-light">{suggestion}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
