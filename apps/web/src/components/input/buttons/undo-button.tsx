import { Icons } from '../../icons';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketRequestType } from 'websocket';
import { Button } from './button';

export function UndoButton({ className }: { className?: string }) {
  const sendToServer = useWebsocketStore((state) => state.sendToServer);
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

  function undo() {
    if (!instanceId) return;

    sendToServer({
      type: StarlightWebSocketRequestType.undoMessage,
      data: {
        instanceId,
      },
    });
  }

  return <Button className={className} onClick={undo} icon={<Icons.undo />} />;
}
