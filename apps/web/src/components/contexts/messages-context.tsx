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
  const { addMessageHandler, removeMessageHandler } = useWebSocket();
  const [messages, setMessages] = useState<MessageLike[]>([]);

  function addMessage(message: MessageLike) {
    setMessages((messages) => [...messages, message]);
  }

  function updateMessage(message: MessageLike) {
    setMessages((messages) => {
      const messageExists = messages.some((existingMessage) => existingMessage.id === message.id);

      if (messageExists) {
        return messages.map((existingMessage) => (existingMessage.id === message.id ? message : existingMessage));
      } else {
        return [...messages, message];
      }
    });
  }

  function removeMessage(messageId: string) {
    setMessages((messages) => messages.filter((message) => message.id !== messageId));
  }

  useEffect(() => {
    // TODO: add something like this
    // addMessageHandler(addMessage);
    // addMessageHandler(updateMessage);
    // addMessageHandler(removeMessage);
    // return () => {
    //   removeMessageHandler(addMessage);
    //   removeMessageHandler(updateMessage);
    //   removeMessageHandler(removeMessage);
    // };
  }, []);

  return <MessagesContext.Provider value={{ messages, setMessages }}>{children}</MessagesContext.Provider>;
}

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
