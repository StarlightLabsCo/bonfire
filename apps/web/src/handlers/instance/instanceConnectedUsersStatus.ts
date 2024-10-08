import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleInstanceConnectedUsersStatus(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceConnectedUsersStatus) {
    const currentInstanceId = useCurrentInstanceStore.getState().instanceId;
    if (currentInstanceId === response.data.instanceId) {
      const setConnectedUsers = useCurrentInstanceStore.getState().setConnectedUsers;

      setConnectedUsers(response.data.connectedUsers);
    }
  }
}
