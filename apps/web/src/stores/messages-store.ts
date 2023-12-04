'use client';

import { create } from 'zustand';
import { Message } from '@prisma/client';
import { MessageRole } from 'database';

type MessagesStore = {
  messages: Array<Message>;
  setMessages: (messages: Array<Message>) => void;
  addMessage: (message: Message) => void;
  replaceMessage: (messageId: string, content: string) => void;
  upsertMessage: (message: Message) => void;
  deleteMessage: (id: string) => void;

  submittedMessage: string | null;
  setSubmittedMessage: (submittedMessage: string | null) => void;

  streamedMessageId: string | null;
  streamedWords: Array<string> | null;
};

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  messages: [],
  setMessages: (messages) => set(() => ({ messages })),
  addMessage: (message: Message) => {
    if (message.role === MessageRole.assistant) {
      set((state) => ({
        messages: [...state.messages, message],
        streamedMessageId: message.id,
        streamedWords: message.content.split(' '),
      }));
    } else {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    }
  },
  replaceMessage: (messageId: string, content: string) => {
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
    }));
  },
  upsertMessage: (message: Message) => {
    let found = false;

    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === message.id) {
          found = true;
          return message;
        }
        return m;
      }),
      streamedWords: state.streamedMessageId === message.id ? message.content.split(' ') : null,
    }));

    if (!found) {
      get().addMessage(message);
    }
  },
  deleteMessage: (id: string) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  submittedMessage: null,
  setSubmittedMessage: (submittedMessage: string | null) => set(() => ({ submittedMessage })),

  streamedWords: null,
  streamedMessageId: null,
}));
