import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageAdded(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageAdded) {
    useMessagesStore.getState().addMessage(response.data.message);

    if (useMessagesStore.getState().submittedMessage) {
      useMessagesStore.getState().setSubmittedMessage(null);
    }
  }
}
