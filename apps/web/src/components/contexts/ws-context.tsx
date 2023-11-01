'use client';

import * as Sentry from '@sentry/nextjs';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  StarlightWebSocketRequest,
  StarlightWebSocketRequestType,
  StarlightWebSocketResponse,
  StarlightWebSocketResponseType,
  validateRequest,
  validateResponse,
} from 'websocket';

// ** ------------- WebSocketContext ------------- **
interface WebSocketContextType {
  socketState: string | null;
  sendToServer: (data: StarlightWebSocketRequest) => void;
  addMessageHandler: (handler: (response: StarlightWebSocketResponse) => void) => void;
  removeMessageHandler: (handler: (response: StarlightWebSocketResponse) => void) => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socketState: null,
  sendToServer: () => {},
  addMessageHandler: () => {},
  removeMessageHandler: () => {},
});

// ** ------------- WebSocketProvider ------------- **
let exponentialBackoff = 1000;

type MessageHandler = (response: StarlightWebSocketResponse) => void;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<WebSocket | null>(null);
  const [socketState, setSocketState] = useState<string | null>(null);

  const [heartbeat, setHeartbeat] = useState<NodeJS.Timeout | null>(null);
  const isAliveRef = useRef<boolean>(false);

  const connectionIdRef = useRef<string | null>(null);

  const [messageHandlers, setMessageHandlers] = useState<MessageHandler[]>([
    handleHeartbeatRequest,
    handleHeartbeatResponse,
  ]);

  function addMessageHandler(handler: MessageHandler) {
    setMessageHandlers((prevHandlers) => [...prevHandlers, handler]);
  }

  function removeMessageHandler(handler: MessageHandler) {
    setMessageHandlers((prevHandlers) => prevHandlers.filter((h) => h !== handler));
  }

  function sendToServer(request: StarlightWebSocketRequest) {
    const data = JSON.stringify(request);

    const validated = validateRequest(data);
    if (!validated) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    } else {
      console.error('WebSocket is not in valid state. Unable to send data.');
    }
  }

  function handleHeartbeatRequest(response: StarlightWebSocketResponse) {
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

  function handleHeartbeatResponse(response: StarlightWebSocketResponse) {
    if (response.type === StarlightWebSocketResponseType.heartbeatServerResponse) {
      isAliveRef.current = true;
    }
  }

  async function connect() {
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is not set.');
    }

    // Fetch websocket auth token
    let tokenRequest = await fetch('/api/websocket/', {
      method: 'POST',
    });

    if (tokenRequest.status !== 200) {
      console.error('Unable to fetch websocket token.');
      return;
    }

    let response = await tokenRequest.json();

    // Create connectionId if it doesn't exist
    if (!connectionIdRef.current) {
      connectionIdRef.current = Math.random().toString(36).substring(2, 15);
    }

    // Intialize websocket connection
    let ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}?token=${response.token}&connectionId=${connectionIdRef.current}`,
    );

    socketRef.current = ws;
    setSocketState('connecting');

    ws.addEventListener('open', () => {
      setSocketState('open');
      exponentialBackoff = 1000;

      isAliveRef.current = true;

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (!isAliveRef.current) {
          console.error('Client heartbeat request failed to recieve response. Closing connection.');
          ws.close();
          return;
        }

        isAliveRef.current = false;

        sendToServer({
          type: StarlightWebSocketRequestType.heartbeatClientRequest,
          data: {
            timestamp: Date.now(),
          },
        });
      }, 30000);

      setHeartbeat(heartbeat);
    });

    ws.addEventListener('message', (event) => {
      try {
        const response = validateResponse(event.data);
        if (!response) return;

        messageHandlers.forEach((handler) => handler(response));
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
      socketRef.current = null;
      setSocketState('closed');

      if (!event.wasClean) {
        console.error(`WebSocket connection died, code=${event.code} reason=${event.reason}`);
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
        exponentialBackoff *= 2;
        connect();
      }, exponentialBackoff);
    });

    return () => {
      ws.close();
    };
  }

  useEffect(() => {
    connect();

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      setHeartbeat(null);

      socketRef.current?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socketState,
        sendToServer,
        addMessageHandler,
        removeMessageHandler,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
