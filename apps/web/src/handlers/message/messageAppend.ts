import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageAppend(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageAppend) {
    useMessagesStore.getState().appendMessage(response.data.messageId, response.data.delta);
  }
}
