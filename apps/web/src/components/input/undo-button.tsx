import { useEffect, useState } from 'react';
import { MessageLike, useMessages } from '../contexts/messages-context';
import { useWebSocket } from '../contexts/ws-context';
import { MessageRole } from '@prisma/client';
import { Icons } from '../icons';

export function UndoButton() {
  const { sendJSON, instanceId } = useWebSocket();
  const { messages, setMessages } = useMessages();

  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // go through all the messages and see if there are atleast 2 generate_suggestions messages
    // if there are, show the undo button

    const messagesCopy = [...messages].reverse();
    let generateSuggestionsCount = 0;

    for (let i = 0; i < messagesCopy.length; i++) {
      const message = messagesCopy[i];

      if (message.role === MessageRole.function) {
        const content = message.content && JSON.parse(message.content);

        if (content.type === 'generate_suggestions') {
          generateSuggestionsCount++;
          if (generateSuggestionsCount === 2) {
            setVisible(true);
            return;
          }
        }

        continue;
      }
    }

    setVisible(false);
    return;
  }, [messages]);

  function getMessagesToUndo() {
    const messagesCopy = [...messages].reverse();
    let generateSuggestionsCount = 0;

    for (let i = 0; i < messagesCopy.length; i++) {
      const message = messagesCopy[i];

      if (message.role === MessageRole.function) {
        const content = JSON.parse(message.content);

        if (content.type === 'generate_suggestions') {
          generateSuggestionsCount++;
          if (generateSuggestionsCount === 2) {
            return messagesCopy.slice(0, i);
          }
        }

        continue;
      }
    }

    return [];
  }

  function removeMessages(messagesToRemove: MessageLike[]) {
    setMessages((messages) =>
      messages.filter((message) => !messagesToRemove.includes(message)),
    );
  }

  function undo() {
    const messagesToUndo = getMessagesToUndo();
    removeMessages(messagesToUndo);

    sendJSON({
      type: 'undo',
      payload: {
        instanceId,
      },
    });
  }

  if (visible) {
    return (
      <button
        className="flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s"
        onClick={undo}
      >
        <Icons.undo />
      </button>
    );
  } else {
    return null;
  }
}
