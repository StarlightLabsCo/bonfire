import { useDialogStore } from '@/stores/dialog-store';
import { useWebsocketStore } from '@/stores/websocket-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleAnotherOpenTab(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.anotherOpenTab) {
    useWebsocketStore.setState({ disconnectedByServer: true });
    useDialogStore.setState({ isAnotherOpenTabDialogOpen: true });
  }
}
