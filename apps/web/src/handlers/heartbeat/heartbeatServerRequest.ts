import { StarlightWebSocketResponse, StarlightWebSocketResponseType } from 'websocket';

export function handleHeartbeatRequest(response: StarlightWebSocketResponse) {
  if (response.type === StarlightWebSocketResponseType.heartbeatServerRequest) {
    sendToServer({
      type: StarlightWebSocketRequestType.heartbeatClientResponse,
      data: {
        timestamp: response.data.timestamp,
        receivedTimestamp: Date.now(),
      },
    });
  }
}
