import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketRequestType } from 'websocket';

//
export function RetryButton({ className }: { className?: string }) {
  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

  const resume = () => {
    if (!instanceId) return;

    sendToServer({
      type: StarlightWebSocketRequestType.resumeInstance,
      data: {
        instanceId,
      },
    });
  };

  return (
    <button
      className={cn(
        'flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 rounded-full border-[0.5px] border-white/20 hover:border-white/30 bg-neutral-950 text-white/50 hover:text-white/80',
        className,
      )}
      onClick={resume}
    >
      <Icons.retry />
    </button>
  );
}
