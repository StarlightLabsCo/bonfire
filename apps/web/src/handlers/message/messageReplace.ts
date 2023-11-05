import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageReplace(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageReplace) {
    useMessagesStore.getState().replaceMessage(response.data.messageId, response.data.content);
  }
}
