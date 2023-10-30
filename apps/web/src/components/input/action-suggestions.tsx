'use client';

import { useEffect, useState } from 'react';
import { Suggestions } from './suggestions';
import { useWebSocket } from '../contexts/ws-context';
import { useMessages } from '../contexts/messages-context';
import { useAudioProcessor } from '../contexts/audio-context';

interface ActionSuggestionsProps {
  suggestions: string[];
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
}

export function ActionSuggestions({
  suggestions,
  setSuggestions,
  className,
}: ActionSuggestionsProps) {
  const { sendJSON, instanceId } = useWebSocket();
  const { clearAudio } = useAudioProcessor();
  const { messages, setMessages } = useMessages();

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role === 'function') {
        const lastMessageContent: {
          type: string;
          payload: any;
        } = lastMessage.content && JSON.parse(lastMessage.content);

        if (
          lastMessageContent &&
          lastMessageContent.type === 'generate_suggestions'
        ) {
          let suggestions: string[] = lastMessageContent.payload.map(
            (suggestion: {
              action: string;
              modifier: number;
              reason: string;
            }) => suggestion.action,
          );
          setSuggestions(suggestions);
        }
      }
    } else {
      setSuggestions([]);
    }
  }, [messages]);

  const submitAction = (suggestion: string) => {
    clearAudio();

    sendJSON({
      type: 'addPlayerMessage',
      payload: {
        instanceId,
        content: suggestion,
      },
    });

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: 'user',
        content: suggestion,
      },
    ]);

    setSuggestions([]);
  };

  return (
    <Suggestions
      suggestions={suggestions}
      onSelect={(suggestion: string) => submitAction(suggestion)}
      className={className}
    />
  );
}
