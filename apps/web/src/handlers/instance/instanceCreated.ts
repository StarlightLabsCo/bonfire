import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useUiStore } from '@/stores/ui-store';

export function handleInstanceCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceCreated) {
    useCurrentInstanceStore.setState({ instanceId: response.data.instanceId });
    useUiStore.getState().setNavigationPath(`/instances/${response.data.instanceId}`);
  }
}
