import { ServerWebSocket } from 'bun';
import { authHandler } from './auth';
import { WebSocketData } from '../src';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
} from 'websocket/types';

export const handlers: {
  [key: string]: (
    ws: ServerWebSocket<WebSocketData>,
    request: StarlightWebSocketRequest,
  ) => void;
} = {
  [StarlightWebSocketRequestType.auth]: authHandler,
};
