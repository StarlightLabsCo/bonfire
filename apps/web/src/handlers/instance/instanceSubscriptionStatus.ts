import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

export function handleInstanceSubscriptionStatus(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceSubscriptionStatus) {
    const currentInstance = useCurrentInstanceStore.getState();
    if (currentInstance.instanceId === response.data.instanceId) {
      console.log(`Setting instance ${response.data.instanceId} subscribed to ${response.data.subscribed}`);
      useCurrentInstanceStore.setState({ subscribed: response.data.subscribed });
    }
  }
}
