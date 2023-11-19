import { useDialogStore } from '@/stores/dialog-store';
import { useMessagesStore } from '@/stores/messages-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleOutOfCredits(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.outOfCredits) {
    useDialogStore.setState({ isCreditsDialogOpen: true });
    useMessagesStore.getState().setSubmittedMessage(null);
  }
}
