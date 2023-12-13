import { useWebsocketStore } from '@/stores/websocket-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { Icons } from '@/components/icons';
import { Button } from './button';
import { cn } from '@/lib/utils';

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

  return <Button className={cn('animate-pulse text-white border-white', className)} onClick={resume} icon={<Icons.retry />} />;
}
