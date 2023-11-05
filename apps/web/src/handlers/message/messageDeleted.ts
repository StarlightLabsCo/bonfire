import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageDeleted(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageDeleted) {
    useMessagesStore.getState().deleteMessage(response.data.messageId);
  }
}
