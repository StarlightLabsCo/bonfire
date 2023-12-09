import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageUpsert(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageUpsert) {
    const currentInstance = useCurrentInstanceStore.getState().instanceId;
    if (currentInstance !== response.data.instanceId) {
      return;
    }

    useMessagesStore.getState().upsertMessage(response.data.message);
  }
}
