import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';

export function handleInstanceStageChanged(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceStageChanged) {
    const currentInstanceId = useCurrentInstanceStore.getState().instanceId;
    if (currentInstanceId === response.data.instanceId) {
      console.log('instance stage changed', response.data.stage);
      useCurrentInstanceStore.setState({ stage: response.data.stage });
    }
  }
}
