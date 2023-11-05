import { useWebsocketStore } from '@/stores/websocket-store';
import { StarlightWebSocketRequestType, StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleHeartbeatRequest(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.heartbeatServerRequest) {
    const sendToServer = useWebsocketStore.getState().sendToServer;

    sendToServer({
      type: StarlightWebSocketRequestType.heartbeatClientResponse,
      data: {
        timestamp: response.data.timestamp,
        receivedTimestamp: Date.now(),
      },
    });
  }
}
