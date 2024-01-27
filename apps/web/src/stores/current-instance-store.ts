'use client';

import { create } from 'zustand';
import { useWebsocketStore } from './websocket-store';
import { InstanceConnectedUser, StarlightWebSocketRequestType } from 'websocket';
import { InstanceStage } from 'database';

type CurrentInstanceStore = {
  instanceId: string | null;
  locked: boolean;
  lockedAt: Date | null;
  subscribed: boolean;
  connectedRegisteredUsers: InstanceConnectedUser[];
  connectedAnonymousUsers: number;

  stage: InstanceStage | null;
  setInstanceId: (instanceId: string | null) => void;
  setLocked: (locked: boolean) => void;
  setLockedAt: (lockedAt: Date | null) => void;
  setConnectedRegisteredUsers: (connectedUsers: CurrentInstanceStore['connectedRegisteredUsers']) => void;
  setConnectedAnonymousUsers: (connectedUsers: number) => void;
  setStage: (stage: InstanceStage | null) => void;

  subscribeToInstance: (instanceId: string) => void;
  unsubscribeFromInstance: (instanceId: string) => void;
};

export const useCurrentInstanceStore = create<CurrentInstanceStore>((set, get) => ({
  instanceId: null,
  locked: false,
  lockedAt: null,
  subscribed: false,
  connectedRegisteredUsers: [],
  connectedAnonymousUsers: 0,
  stage: null,
  setInstanceId: (instanceId: string | null) => {
    const { instanceId: currentInstanceId, unsubscribeFromInstance } = get();
    if (currentInstanceId) {
      unsubscribeFromInstance(currentInstanceId);
    }
    set({ instanceId, subscribed: false });
  },
  setLocked: (locked: boolean) => set({ locked }),
  setLockedAt: (lockedAt: Date | null) => set({ lockedAt }),
  setConnectedRegisteredUsers: (connectedRegisteredUsers: CurrentInstanceStore['connectedRegisteredUsers']) =>
    set({ connectedRegisteredUsers }),
  setConnectedAnonymousUsers: (connectedAnonymousUsers: number) => set({ connectedAnonymousUsers }),
  setStage: (stage: InstanceStage | null) => set({ stage }),

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
