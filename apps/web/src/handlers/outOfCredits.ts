import { useDialogStore } from '@/stores/dialog-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleOutOfCredits(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.outOfCredits) {
    useDialogStore.setState({ isCreditsDialogOpen: true });
  }
}
