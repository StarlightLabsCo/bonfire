import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';
import { toast } from 'sonner';

export function handleError(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.error) {
    toast.error(response.data.message);
  }
}
