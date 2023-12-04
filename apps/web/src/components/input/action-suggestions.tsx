'use client';

import { ActionSuggestion, StarlightWebSocketRequestType } from 'websocket';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useWebsocketStore } from '@/stores/websocket-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { useMessagesStore } from '@/stores/messages-store';
import { cn } from '@/lib/utils';
import { MessageRole } from 'database';

interface ActionSuggestionsProps {
  className?: string;
}

export function ActionSuggestions({ className }: ActionSuggestionsProps) {
  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);
  const messages = useMessagesStore((state) => state.messages);
  const submittedMessage = useMessagesStore((state) => state.submittedMessage);
  const setSubmittedMessage = useMessagesStore((state) => state.setSubmittedMessage);
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

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

    setSubmittedMessage(suggestion);
  };

  return (
    <div className={cn('flex flex-nowrap flex-row gap-x-2 gap-y-2 overflow-auto', className)}>
      {submittedMessage == null &&
        messages.length > 0 &&
        messages[messages.length - 1].role == MessageRole.function &&
        messages[messages.length - 1].name == 'action_suggestions' &&
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
  );
}
