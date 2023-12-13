import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

export function handleInstanceSubscriptionStatus(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceSubscriptionStatus) {
    const currentInstanceId = useCurrentInstanceStore.getState().instanceId;
    if (currentInstanceId === response.data.instanceId) {
      console.log(`instance ${currentInstanceId} subscription status changed. subscribed: ${response.data.subscribed}`);
      useCurrentInstanceStore.setState({ subscribed: response.data.subscribed });
    }
  }
}
