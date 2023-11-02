import { useEffect, useState } from 'react';
import { Input } from './input';
import { useWebSocket } from '../contexts/ws-context';
import { cn } from '@/lib/utils';
import { Suggestions } from './suggestions';
import { useAdventureSuggestionsStore } from '@/stores/adventure-suggestions-store';
import { StarlightWebSocketRequestType, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

interface LobbyInputProps {
  userId: string;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export function LobbyInput({ userId, submitted, setSubmitted, className }: LobbyInputProps) {
  const [description, setDescription] = useState('');

  const { sendToServer, socketState, addMessageHandler, removeMessageHandler } = useWebSocket();
  const { adventureSuggestions, setAdventureSuggestions } = useAdventureSuggestionsStore();

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

  const adventureSuggestionsCreated = (response: StarlightWebSocketResponse) => {
    if (response.type === StarlightWebSocketResponseType.adventureSuggestionsCreated) {
      const { suggestions } = response.data;
      setAdventureSuggestions(suggestions);
    }
  };

  useEffect(() => {
    addMessageHandler(adventureSuggestionsCreated);

    return () => {
      removeMessageHandler(adventureSuggestionsCreated);
    };
  }, []);

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
      <Suggestions
        suggestions={adventureSuggestions}
        onSelect={(suggestion) => {
          submit(suggestion);
        }}
        className={cn('items-center justify-center w-full h-10', submitted && 'cursor-not-allowed fade-out-2s ')}
      />
    </div>
  );
}
