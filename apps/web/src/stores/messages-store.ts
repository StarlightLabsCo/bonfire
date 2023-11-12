'use client';

import { create } from 'zustand';
import { Message } from '@prisma/client';

type MessagesStore = {
  messages: Array<Message>;
  setMessages: (messages: Array<Message>) => void;
  addMessage: (message: Message) => void;
  appendMessage: (messageId: string, delta: string) => void;
  replaceMessage: (messageId: string, content: string) => void;
  deleteMessage: (id: string) => void;

  submittedMessage: string | null;
  setSubmittedMessage: (submittedMessage: string | null) => void;
};

export const useMessagesStore = create<MessagesStore>((set) => ({
  messages: [],
  setMessages: (messages) => set(() => ({ messages })),
  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  appendMessage: (messageId: string, delta: string) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            content: m.content + delta,
          };
        }
        return m;
      }),
    })),
  replaceMessage: (messageId: string, content: string) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            content,
          };
        }
        return m;
      }),
    })),
  deleteMessage: (id: string) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  submittedMessage: null,
  setSubmittedMessage: (submittedMessage: string | null) => set(() => ({ submittedMessage })),
}));
