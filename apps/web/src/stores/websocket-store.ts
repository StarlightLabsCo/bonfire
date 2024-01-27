'use client';

import * as Sentry from '@sentry/nextjs';
import { create } from 'zustand';
import { StarlightWebSocketRequest, StarlightWebSocketRequestType, validateRequest, validateResponse } from 'websocket';
import { handlers } from '@/handlers';

type WebsocketStore = {
  connect: () => void;
  exponentialBackoff: number;

  socket: WebSocket | null;
  socketState: string | null;

  heartbeat: NodeJS.Timeout | null;
  isAlive: boolean;

  sendToServer: (request: StarlightWebSocketRequest) => void;
};

export const useWebsocketStore = create<WebsocketStore>((set, get) => ({
  connect: () => connect(set, get),
  exponentialBackoff: 1000,

  socket: null,
  socketState: null,

  heartbeat: null,
  isAlive: false,

  sendToServer: (request) => sendToServer(get, request),
}));

type WebsocketStoreSet = (arg0: {
  socket?: WebSocket | null;
  socketState?: string;
  isAlive?: boolean;
  exponentialBackoff?: number;
  heartbeat?: NodeJS.Timeout | null;
}) => void;

async function connect(set: WebsocketStoreSet, get: () => WebsocketStore) {
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is not set.');
  }

  try {
    // Clear existing socket (if any)
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }

    // Initialize new socket
    let ws: WebSocket;

    let tokenRequest = await fetch('/api/websocket/', {
      method: 'POST',
    });

    if (tokenRequest.status !== 200) {
      ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL);
    } else {
      let response = await tokenRequest.json();
      ws = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_URL}?token=${response.token}`);
    }

    set({ socket: ws, socketState: 'connecting' });

    ws.addEventListener('open', () => {
      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        const { isAlive, sendToServer } = get();

        if (!isAlive) {
          console.error('Client heartbeat request failed to recieve response. Closing connection.');
          ws.close();
          return;
        }

        set({ isAlive: false });

        sendToServer({
          type: StarlightWebSocketRequestType.heartbeatClientRequest,
          data: {
            timestamp: Date.now(),
          },
        });
      }, 30000);

      set({ socketState: 'open', exponentialBackoff: 1000, isAlive: true, heartbeat });
    });

    ws.addEventListener('message', (event) => {
      try {
        const response = validateResponse(event.data);
        if (!response) return;

        const handler = handlers[response.type as keyof typeof handlers];
        if (!handler) {
          console.error(`No handler found for response type: ${response.type}`);
          return;
        }

        handler(response);
      } catch (error) {
        console.error('Error in handling WebSocket message:', error);
        Sentry.captureException(error);
      }
    });

    ws.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      Sentry.captureException(event, {
        contexts: {
          websocket: {
            socket: ws,
            event: event,
            eventJSON: JSON.stringify(event),
          },
        },
      });
    });

    ws.addEventListener('close', (event) => {
      const { heartbeat } = get();
      if (heartbeat !== null) {
        clearInterval(heartbeat);
      }

      set({ socket: null, socketState: 'closed', isAlive: false, heartbeat: null });

      console.log(`WebSocket connection closed. Code: ${event.code} Reason: ${event.reason}`);

      if (!event.wasClean) {
        Sentry.captureException(event, {
          contexts: {
            websocket: {
              socket: ws,
              event: event,
              eventJSON: JSON.stringify(event),
            },
          },
        });
      }

      setTimeout(() => {
        set({ exponentialBackoff: get().exponentialBackoff * 2 });
        get().connect();
      }, get().exponentialBackoff);
    });
  } catch (error) {
    console.error('Error in connecting to WebSocket:', error);
    Sentry.captureException(error);

    setTimeout(() => {
      set({ exponentialBackoff: get().exponentialBackoff * 2 });
      get().connect();
    }, get().exponentialBackoff);
  }
}

function sendToServer(get: () => WebsocketStore, request: StarlightWebSocketRequest) {
  const data = JSON.stringify(request);

  const validated = validateRequest(data);
  if (!validated) return;

  const { socket, socketState } = get();

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(data);
  } else {
    console.error(`WebSocket is not in valid state. Current state: ${socketState}. Unable to send data.`);
  }
}
