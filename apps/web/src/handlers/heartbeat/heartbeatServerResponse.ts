import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleHeartbeatResponse(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.heartbeatServerResponse) {
    isAliveRef.current = true;
    console.log(`Roundtrip latency: ${Date.now() - response.data.timestamp}ms`);
  }
}
