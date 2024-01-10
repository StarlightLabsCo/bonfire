'use client';

import { cn } from '@/lib/utils';
import { useWebsocketStore } from '@/stores/websocket-store';
import { StarlightWebSocketRequestType } from 'websocket';

type PlayTemplateButtonProps = {
  templateId: string;
  className?: string;
};

export function PlayTemplateButton({ templateId, className }: PlayTemplateButtonProps) {
  const sendToServer = useWebsocketStore((state) => state.sendToServer);

  const playInstance = () => {
    sendToServer({
      type: StarlightWebSocketRequestType.createInstance,
      data: {
        instanceTemplateId: templateId,
        description: null,
      },
    });
  };

  return (
    <div onClick={playInstance} className={cn('bg-orange-500 px-4 py-1 rounded-full cursor-pointer hover:scale-105', className)}>
      Play
    </div>
  );
}
