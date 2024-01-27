import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleInstanceConnectedUsersStatus(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.instanceConnectedUsersStatus) {
    const currentInstanceId = useCurrentInstanceStore.getState().instanceId;
    if (currentInstanceId === response.data.instanceId) {
      const setConnectedRegisteredUsers = useCurrentInstanceStore.getState().setConnectedRegisteredUsers;
      const setConnectedAnonymousUsers = useCurrentInstanceStore.getState().setConnectedAnonymousUsers;

      setConnectedRegisteredUsers(response.data.registeredUsers);
      setConnectedAnonymousUsers(response.data.anonymousUsers);
    }
  }
}
