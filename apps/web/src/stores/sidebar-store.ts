'use client';

import { create } from 'zustand';

type SidebarStore = {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;

  showSidebarOpenButton: boolean;
  setShowSidebarOpenButton: (value: boolean) => void;

  storyMessageContainerScrollTop: number;
  mobileHeaderHeight: number;
  setStoryMessageContainerScrollTop: (value: number) => void;
  setMobileHeaderHeight: (value: number) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isSidebarOpen: false,
  openSidebar: () => set((state) => ({ ...state, isSidebarOpen: true, showSidebarOpenButton: false })),
  closeSidebar: () => set((state) => ({ ...state, isSidebarOpen: false })),

  showSidebarOpenButton: true,
  setShowSidebarOpenButton: (value: boolean) => set((state) => ({ ...state, showSidebarOpenButton: value })),

  storyMessageContainerScrollTop: 0,
  mobileHeaderHeight: 0,
  setStoryMessageContainerScrollTop: (value: number) =>
    set((state) => ({ ...state, storyMessageContainerScrollTop: value })),
  setMobileHeaderHeight: (value: number) =>
    set((state) => {
      return { ...state, mobileHeaderHeight: value };
    }),
}));
