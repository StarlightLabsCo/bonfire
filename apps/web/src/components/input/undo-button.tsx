import { Icons } from '../icons';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { useEffect, useState } from 'react';
import { MessageRole } from 'database';
import { cn } from '@/lib/utils';

export function UndoButton({ className }: { className?: string }) {
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
        className={cn(
          'flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 rounded-full border-[0.5px] border-white/20 hover:border-white/30 bg-neutral-950 text-white/50 hover:text-white/80 fade-in-2s',
          className,
        )}
        onClick={undo}
      >
        <Icons.undo />
      </button>
    );
  } else {
    return (
      <button
        className={cn(
          'md:hidden flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 rounded-full border-[0.5px] border-white/20 hover:border-white/30 bg-neutral-950 text-white/50 hover:text-white/80 fade-in-2s',
          className,
        )}
        onClick={undo}
      >
        <Icons.lockClosed />
      </button>
    );
  }
}
