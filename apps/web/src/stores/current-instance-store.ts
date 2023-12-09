'use client';

import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';
import { StarlightWebSocketRequestType } from 'websocket';

type CurrentInstanceStore = {
  instanceId: string | null;
  locked: boolean;
  subscribed: boolean;
  setInstanceId: (instanceId: string | null) => void;
  setLocked: (locked: boolean) => void;

  subscribeToInstance: (instanceId: string) => void;
  unsubscribeFromInstance: (instanceId: string) => void;
};

export const useCurrentInstanceStore = create<CurrentInstanceStore>((set, get) => ({
  instanceId: null,
  locked: false,
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
