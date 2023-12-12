import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useUiStore } from '@/stores/ui-store';

export function handleInstanceCreated(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceCreated) {
    useUiStore.getState().setNavigationPath(`/instances/${response.data.instanceId}`);
  }
}
