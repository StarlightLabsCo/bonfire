import { Icons } from '../icons';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { useEffect, useState } from 'react';
import { MessageRole } from 'database';

export function UndoButton() {
  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);
  const isLocked = useCurrentInstanceStore((state) => state.locked);
  const messages = useMessagesStore((state) => state.messages);

  const [visible, setVisible] = useState<boolean>(false);

  function undo() {
    if (!instanceId) return;

    sendToServer({
      type: StarlightWebSocketRequestType.undoMessage,
      data: {
        instanceId,
      },
    });
  }

  useEffect(() => {
    const hasUserMessage = messages.some((message) => message.role === MessageRole.user) && !isLocked;
    setVisible(hasUserMessage);
  }, [messages, isLocked]);

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
