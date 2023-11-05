import { ToasterToast } from '@/components/ui/use-toast';
import { useUiStore } from '@/stores/ui-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleError(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.error) {
    useUiStore.getState().setToast({
      title: 'Error',
      description: response.data.message,
    } as ToasterToast);
  }
}
