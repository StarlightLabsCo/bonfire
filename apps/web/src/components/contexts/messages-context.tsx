'use client';

import { Message } from '@prisma/client';
import { createContext, useContext, useEffect, useState } from 'react';
import { WebSocketContext, useWebSocket } from './ws-context';

export type MessageLike = Message | { id: string; role: string; content: string };

type MessagesContextValue = {
  messages: Array<MessageLike>;
  setMessages: React.Dispatch<React.SetStateAction<Array<MessageLike>>>;
};

export const MessagesContext = createContext<MessagesContextValue>({
  messages: [],
  setMessages: () => {},
});

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useWebSocket();
  const [messages, setMessages] = useState<MessageLike[]>([]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        console.log('data', data);

        if (data.type === WebSocketResponseType.message) {
          setMessages((messages) => {
            const messageExists = messages.some((message) => message.id === data.payload.id);

            if (messageExists) {
              return messages.map((message) =>
                message.id === data.payload.id
                  ? {
                      id: data.payload.id,
                      role: 'assistant',
                      content: data.payload.content,
                    }
                  : message,
              );
            } else {
              return [
                ...messages,
                {
                  id: data.payload.id,
                  role: 'assistant',
                  content: data.payload.content,
                },
              ];
            }
          });
        } else if (data.type === WebSocketResponseType['message-append']) {
          setMessages((messages) => {
            const messageExists = messages.some((message) => message.id === data.payload.id);

            if (messageExists) {
              return messages.map((message) =>
                message.id === data.payload.id
                  ? {
                      id: data.payload.id,
                      role: 'assistant',
                      content: message.content + data.payload.content,
                    }
                  : message,
              );
            } else {
              console.error(`Message ${data.payload.id} does not exist.`);
              return messages;
            }
          });
        } else if (data.type === WebSocketResponseType.image) {
          setMessages((messages) => {
            const messageExists = messages.some((message) => message.id === data.payload.id);

            if (messageExists) {
              return messages.map((message) =>
                message.id === data.payload.id
                  ? {
                      id: data.payload.id,
                      role: 'function',
                      content: data.payload.content,
                    }
                  : message,
              );
            } else {
              return [
                ...messages,
                {
                  id: data.payload.id,
                  role: 'function',
                  content: data.payload.content,
                },
              ];
            }
          });
        } else if (data.type === WebSocketResponseType.suggestions) {
          setMessages((messages) => {
            return [
              ...messages,
              {
                id: data.payload.id,
                role: 'function',
                content: data.payload.content,
              },
            ];
          });
        }
      });
    }
  }, [socket]);

  return <MessagesContext.Provider value={{ messages, setMessages }}>{children}</MessagesContext.Provider>;
}

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
