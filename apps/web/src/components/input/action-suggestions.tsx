'use client';

import { useEffect } from 'react';
import { Suggestions } from './suggestions';
import { useWebSocket } from '../contexts/ws-context';
import { useMessages } from '../contexts/messages-context';
import { StarlightWebSocketRequestType } from 'websocket';
import { usePlayback } from '../contexts/audio/playback-context';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

interface ActionSuggestionsProps {
  suggestions: string[];
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
}

export function ActionSuggestions({ suggestions, setSuggestions, className }: ActionSuggestionsProps) {
  const { sendToServer } = useWebSocket();
  const { clearAudio } = usePlayback();
  const { messages, setMessages } = useMessages();
  const { instanceId } = useCurrentInstanceStore();

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.role === 'function') {
        const lastMessageContent: {
          type: string;
          payload: any;
        } = lastMessage.content && JSON.parse(lastMessage.content);

        if (lastMessageContent && lastMessageContent.type === 'generate_suggestions') {
          let suggestions: string[] = lastMessageContent.payload.map(
            (suggestion: { action: string; modifier: number; reason: string }) => suggestion.action,
          );
          setSuggestions(suggestions);
        }
      }
    } else {
      setSuggestions([]);
    }
  }, [messages]);

  const submitAction = (suggestion: string) => {
    if (!instanceId) return;

    clearAudio();

    sendToServer({
      type: StarlightWebSocketRequestType.addPlayerMessage,
      data: {
        instanceId,
        message: suggestion,
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
