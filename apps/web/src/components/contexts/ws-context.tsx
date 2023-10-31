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
  socket: WebSocket | null;
  socketState: string | null;
  sendToServer: (data: StarlightWebSocketRequest) => void;
  addMessageHandler: (handler: (response: StarlightWebSocketResponse) => void) => void;
  removeMessageHandler: (handler: (response: StarlightWebSocketResponse) => void) => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  socketState: null,
  sendToServer: () => {},
  addMessageHandler: () => {},
  removeMessageHandler: () => {},
});

// ** ------------- WebSocketProvider ------------- **
let exponentialBackoff = 1000;

type MessageHandler = (response: StarlightWebSocketResponse) => void;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketState, setSocketState] = useState<string | null>(null);

  const [heartbeat, setHeartbeat] = useState<NodeJS.Timeout | null>(null);
  const [isAlive, setIsAlive] = useState<boolean>(false);

  const connectionIdRef = useRef<string | null>(null);

  const [messageHandlers, setMessageHandlers] = useState<MessageHandler[]>([handleHeartbeatRequest]);

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

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    } else {
      console.error('WebSocket is not in valid state. Unable to send data.');
    }
  }

  function handleHeartbeatRequest(response: StarlightWebSocketResponse) {
    if (response.type === StarlightWebSocketResponseType.heartbeatServerRequest) {
      console.log('Received heartbeat request from server. Sending response.');
      sendToServer({
        type: StarlightWebSocketRequestType.heartbeatClientResponse,
        data: {
          timestamp: response.data.timestamp,
          receivedTimestamp: Date.now(),
        },
      });
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

    setSocket(ws);
    setSocketState('connecting');

    ws.addEventListener('open', () => {
      setSocketState('open');
      exponentialBackoff = 1000;

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (!isAlive) {
          console.error('WebSocket connection is dead. Closing.');
          ws.close();
          return;
        }

        setIsAlive(false);

        console.log(`Sending heartbeat request to server.`);

        sendToServer({
          type: StarlightWebSocketRequestType.heartbeatClientRequest,
          data: {
            timestamp: Date.now(),
          },
        });
      }, 30000);

      setHeartbeat(heartbeat);

      addMessageHandler((response) => {
        if (response.type === StarlightWebSocketResponseType.heartbeatServerResponse) {
          console.log('Received heartbeat response from server.');
          setIsAlive(true);
        }
      });
    });

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        const response = validateResponse(data);
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
      setSocket(null);
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

      socket?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
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
