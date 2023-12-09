import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageReplace(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageReplace) {
    const currentInstance = useCurrentInstanceStore.getState().instanceId;
    if (currentInstance !== response.data.instanceId) {
      return;
    }

    useMessagesStore.getState().replaceMessage(response.data.messageId, response.data.content);
  }
}
