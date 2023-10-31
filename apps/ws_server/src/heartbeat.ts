import { ServerWebSocket } from 'bun';
import { WebSocketData } from '.';
import {
  HeartbeatClientRequest,
  HeartbeatClientResponse,
  HeartbeatServerRequest,
  StarlightWebSocketResponseType,
} from 'websocket/types';

export function setupHeartbeat(ws: ServerWebSocket<WebSocketData>) {
  const heartbeat = setInterval(() => {
    if (!ws.data.isAlive) {
      ws.close();

      clearHeartbeat(ws);

      return;
    }

    ws.data.isAlive = false;

    console.log('Sending heartbeat');

    ws.send(
      JSON.stringify({
        type: StarlightWebSocketResponseType.heartbeatServerRequest,
        data: {
          timestamp: Date.now(),
        },
      } as HeartbeatServerRequest),
    );
  }, 30000);

  ws.data.heartbeatInterval = heartbeat;
}

// Client requested heartbeat, send response
export function heartbeatClientRequestHandler(ws: ServerWebSocket<WebSocketData>, request: HeartbeatClientRequest) {
  console.log('Received heartbeat request');
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
  console.log('Received heartbeat response');
  ws.data.isAlive = true;
}

export function clearHeartbeat(ws: ServerWebSocket<WebSocketData>) {
  if (ws.data.heartbeatInterval) {
    clearInterval(ws.data.heartbeatInterval);
    ws.data.heartbeatInterval = null;
  }
}
