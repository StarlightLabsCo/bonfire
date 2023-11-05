import { useEffect, useState } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useAdventureSuggestionsStore } from '@/stores/adventure-suggestions-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { useWebsocketStore } from '@/stores/websocket-store';

interface LobbyInputProps {
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export function LobbyInput({ submitted, setSubmitted, className }: LobbyInputProps) {
  const [description, setDescription] = useState('');

  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const socketState = useWebsocketStore((state) => state.socketState);

  const adventureSuggestions = useAdventureSuggestionsStore((state) => state.adventureSuggestions);

  const createWelcome = (description: string) => {
    sendToServer({
      type: StarlightWebSocketRequestType.createWelcomeSoundbite,
      data: {},
    });
  };

  const createInstance = (description: string) => {
    sendToServer({
      type: StarlightWebSocketRequestType.createInstance,
      data: {
        description,
      },
    });
  };

  const submit = (description: string) => {
    setSubmitted(true);
    createWelcome(description);
    createInstance(description);
  };

  useEffect(() => {
    if (socketState == 'open' && adventureSuggestions.length == 0) {
      setTimeout(() => {
        sendToServer({
          type: StarlightWebSocketRequestType.createAdventureSuggestions,
          data: {},
        });
      }, 1000);
    }
  }, [adventureSuggestions, sendToServer, socketState]);

  return (
    <div className={cn(`flex flex-col items-center gap-y-2 w-full mt-10`, className)}>
      <Input
        value={description}
        setValue={setDescription}
        submit={() => submit(description)}
        placeholder="Describe your adventure..."
        disabled={submitted}
        className={cn(submitted && 'cursor-not-allowed fade-out-2s')}
      />
      <div className={cn('flex flex-row flex-wrap gap-x-2 gap-y-2', className)}>
        {adventureSuggestions &&
          adventureSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className="px-3 py-1 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s"
              onClick={() => submit(suggestion)}
            >
              <span className="text-xs md:text-sm font-light">{suggestion}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
