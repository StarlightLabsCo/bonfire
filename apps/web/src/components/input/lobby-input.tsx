import { useEffect, useState } from 'react';
import { Input } from './input';
import { useWebSocket } from '../contexts/ws-context';
import { cn } from '@/lib/utils';
import { Suggestions } from './suggestions';

interface LobbyInputProps {
  userId: string;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export function LobbyInput({
  userId,
  submitted,
  setSubmitted,
  className,
}: LobbyInputProps) {
  const [description, setDescription] = useState('');

  const { sendJSON, adventureSuggestions, socketState } = useWebSocket();

  const createWelcome = (description: string) => {
    sendJSON({
      type: 'welcome',
      payload: {},
    });
  };

  const createInstance = (description: string) => {
    sendJSON({
      type: 'createInstance',
      payload: {
        userId: userId,
        description: description,
      },
    });
  };

  const submit = (description: string) => {
    setSubmitted(true);
    createWelcome(description);
    createInstance(description);
  };

  useEffect(() => {
    if (socketState == 'open' && adventureSuggestions == null) {
      setTimeout(() => {
        sendJSON({
          type: 'generateAdventureSuggestions',
          payload: {},
        });
      }, 1000);
    }
  }, [adventureSuggestions, sendJSON, socketState]);

  return (
    <div
      className={cn(
        `flex flex-col items-center gap-y-2 w-full mt-10`,
        className,
      )}
    >
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
        className={cn(
          'items-center justify-center w-full h-10',
          submitted && 'cursor-not-allowed fade-out-2s ',
        )}
      />
    </div>
  );
}
