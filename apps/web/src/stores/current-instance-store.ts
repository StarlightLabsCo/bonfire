'use client';

import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';
import { StarlightWebSocketRequestType } from 'websocket';

type CurrentInstanceStore = {
  instanceId: string | null;
  locked: boolean;
  lockedAt: Date | null;
  subscribed: boolean;
  setInstanceId: (instanceId: string | null) => void;
  setLocked: (locked: boolean) => void;
  setLockedAt: (lockedAt: Date | null) => void;

  subscribeToInstance: (instanceId: string) => void;
  unsubscribeFromInstance: (instanceId: string) => void;
};

export const useCurrentInstanceStore = create<CurrentInstanceStore>((set, get) => ({
  instanceId: null,
  locked: false,
  lockedAt: null,
  subscribed: false,
  setInstanceId: (instanceId: string | null) => {
    const { instanceId: currentInstanceId, unsubscribeFromInstance } = get();
    if (currentInstanceId) {
      console.log('Unsubscribing from instance', currentInstanceId);
      unsubscribeFromInstance(currentInstanceId);
    }
    set({ instanceId, subscribed: false });
  },
  setLocked: (locked: boolean) => set({ locked }),
  setLockedAt: (lockedAt: Date | null) => set({ lockedAt }),

  subscribeToInstance: (instanceId: string) => {
    const sendToServer = useWebsocketStore.getState().sendToServer;

    sendToServer({
      type: StarlightWebSocketRequestType.subscribeToInstance,
      data: {
        instanceId,
      },
    });
  },
  unsubscribeFromInstance: (instanceId: string) => {
    const sendToServer = useWebsocketStore.getState().sendToServer;

    sendToServer({
      type: StarlightWebSocketRequestType.unsubscribeFromInstance,
      data: {
        instanceId,
      },
    });
  },
}));
