import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import { HeartbeatClientRequest, HeartbeatClientResponse, HeartbeatServerRequest, StarlightWebSocketResponseType } from 'websocket/types';

export function setupHeartbeat(ws: ServerWebSocket<WebSocketData>) {
  ws.data.heartbeatInterval = setInterval(() => {
    if (!ws.data.isAlive) {
      ws.close(1000, 'Server heartbeat request failed to receive response.');

      clearHeartbeat(ws);

      return;
    }

    ws.data.isAlive = false;

    ws.send(
      JSON.stringify({
        type: StarlightWebSocketResponseType.heartbeatServerRequest,
        data: {
          timestamp: Date.now(),
        },
      } as HeartbeatServerRequest),
    );
  }, 30000);
}

// Client requested heartbeat, send response
export function heartbeatClientRequestHandler(ws: ServerWebSocket<WebSocketData>, request: HeartbeatClientRequest) {
  ws.send(
    JSON.stringify({
      type: StarlightWebSocketResponseType.heartbeatServerResponse,
      data: {
        timestamp: request.data.timestamp,
        receivedTimestamp: Date.now(),
      },
    }),
  );
}

// Client responded to heartbeat, update isAlive
export function heartbeatClientResponseHandler(ws: ServerWebSocket<WebSocketData>, request: HeartbeatClientResponse) {
  ws.data.isAlive = true;
}

export function clearHeartbeat(ws: ServerWebSocket<WebSocketData>) {
  if (ws.data.heartbeatInterval) {
    clearInterval(ws.data.heartbeatInterval);
    ws.data.heartbeatInterval = null;
  }
}
