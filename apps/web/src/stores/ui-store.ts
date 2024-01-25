'use client';

import { ReactNode } from 'react';
import { create } from 'zustand';

type UiStore = {
  navigationPath: string | null;
  setNavigationPath: (path: string | null) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  navigationPath: null,
  setNavigationPath: (path) => {
    set({ navigationPath: path });
  },
}));
