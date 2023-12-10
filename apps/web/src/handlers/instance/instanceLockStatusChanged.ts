import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

export function handleInstanceLockStatusChanged(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceLockStatusChanged) {
    const currentInstance = useCurrentInstanceStore.getState();
    if (currentInstance.instanceId === response.data.instanceId) {
      useCurrentInstanceStore.setState({ locked: response.data.locked });
      useCurrentInstanceStore.setState({ lockedAt: response.data.lockedAt });
    }
  }
}
