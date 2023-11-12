'use client';

import { create } from 'zustand';

type SidebarStore = {
  isSidebarOpen: boolean;
  showSidebarOpenButton: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  setShowSidebarOpenButton: (value: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isSidebarOpen: false,
  showSidebarOpenButton: true,
  openSidebar: () => set((state) => ({ ...state, isSidebarOpen: true, showSidebarOpenButton: false })),
  closeSidebar: () => set((state) => ({ ...state, isSidebarOpen: false })),
  setShowSidebarOpenButton: (value: boolean) => set((state) => ({ ...state, showSidebarOpenButton: value })),
}));
