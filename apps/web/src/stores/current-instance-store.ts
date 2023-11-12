'use client';

import { create } from 'zustand';

type CurrentInstanceStore = {
  instanceId: string | null;
  setInstanceId: (instanceId: string | null) => void;
};

export const useCurrentInstanceStore = create<CurrentInstanceStore>((set) => ({
  instanceId: null,
  setInstanceId: (instanceId: string | null) => set({ instanceId }),
}));
