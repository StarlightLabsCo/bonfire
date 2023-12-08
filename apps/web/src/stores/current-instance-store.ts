'use client';

import { create } from 'zustand';

type CurrentInstanceStore = {
  instanceId: string | null;
  locked: boolean;
  setInstanceId: (instanceId: string | null) => void;
  setLocked: (locked: boolean) => void;
};

export const useCurrentInstanceStore = create<CurrentInstanceStore>((set) => ({
  instanceId: null,
  locked: false,
  setInstanceId: (instanceId: string | null) => set({ instanceId }),
  setLocked: (locked: boolean) => set({ locked }),
}));
