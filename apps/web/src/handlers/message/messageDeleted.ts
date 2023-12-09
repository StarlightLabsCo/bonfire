import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageDeleted(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageDeleted) {
    const currentInstance = useCurrentInstanceStore.getState().instanceId;
    if (currentInstance !== response.data.instanceId) {
      return;
    }

    useMessagesStore.getState().deleteMessage(response.data.messageId);
  }
}
