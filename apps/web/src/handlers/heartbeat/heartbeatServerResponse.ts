import { useWebsocketStore } from '@/stores/websocket-store';
import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleHeartbeatResponse(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.heartbeatServerResponse) {
    useWebsocketStore.setState({ isAlive: true });
    console.log(`Roundtrip latency: ${Date.now() - response.data.timestamp}ms`);
  }
}
