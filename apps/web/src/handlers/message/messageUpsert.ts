import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleMessageUpsert(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.messageUpsert) {
    useMessagesStore.getState().upsertMessage(response.data.message);
  }
}
