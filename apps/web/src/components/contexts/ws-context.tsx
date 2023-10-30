'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/navigation';
import { JsonObject } from 'next-auth/adapters';
import { useToast } from '@/components/ui/use-toast';

interface WebSocketContextType {
  socket: WebSocket | null;
  socketState: string | null;
  sendJSON: (data: JsonObject) => void;
  instanceId?: string | null;
  setInstanceId?: React.Dispatch<React.SetStateAction<string | null>>;
  adventureSuggestions?: string[] | null;
  setAdventureSuggestions?: React.Dispatch<React.SetStateAction<string[] | null>>;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  socketState: null,
  sendJSON: () => {},
  instanceId: null,
  setInstanceId: () => {},
  adventureSuggestions: null,
  setAdventureSuggestions: () => {},
});

let exponentialBackoff = 1000;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketState, setSocketState] = useState<string | null>(null);

  const connectionIdRef = useRef<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [adventureSuggestions, setAdventureSuggestions] = useState<string[] | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const sendJSON = (data: JsonObject) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not in valid state. Unable to send data.');
      Sentry.captureException(new Error('WebSocket is not in valid state. Unable to send data.'), {
        contexts: {
          websocket: {
            socket: socket,
            data: data,
          },
        },
      });
    }
  };

  function handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === WebSocketResponseType['adventure-suggestions']) {
        setAdventureSuggestions(JSON.parse(data.payload.content).payload);
      } else if (data.type === WebSocketResponseType.instance) {
        setAdventureSuggestions(null);
        router.push(`/instances/${data.payload.id}`);
      } else if (data.type === WebSocketResponseType.error) {
        toast({
          title: 'Error',
          description: data.payload.content,
        });
      }
    } catch (error) {
      console.error('Error in handling WebSocket message:', error);
      Sentry.captureException(error);
    }
  }

  useEffect(() => {
    console.log('WebSocketProvider mounted.');

    async function connect() {
      console.log('Connecting to WebSocket...');
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

      // Intialize websocket connection
      let ws = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_URL);

      setSocket(ws);
      setSocketState('connecting');

      ws.addEventListener('message', handleMessage);

      ws.addEventListener('open', () => {
        console.log('WebSocket connection established.');

        setSocketState('open');
        exponentialBackoff = 1000;

        if (!connectionIdRef.current) {
          console.log('Generating new connectionId...');
          connectionIdRef.current = Math.random().toString(36).substring(2, 15);
        }

        ws.send(
          JSON.stringify({
            type: 'auth',
            payload: {
              token: response.token,
              connectionId: connectionIdRef.current,
            },
          }),
        );
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

        ws.close();
      });

      ws.addEventListener('close', (event) => {
        setSocket(null);
        setSocketState('closed');

        if (event.wasClean) {
          console.log(`WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
          return;
        } else {
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
          console.log('WebSocket connection closed. Reconnecting...');
          connect();
        }, exponentialBackoff);
      });

      return () => {
        ws.close();
      };
    }

    connect();
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        socketState,
        sendJSON,
        instanceId,
        setInstanceId,
        adventureSuggestions,
        setAdventureSuggestions,
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
