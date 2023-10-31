import { create } from 'zustand';

type SidebarStore = {
  isSidebarOpen: boolean;
  showSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  setShowSidebarOpen: (value: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isSidebarOpen: false,
  showSidebarOpen: true,
  openSidebar: () => set((state) => ({ ...state, isSidebarOpen: true, showSidebarOpen: false })),
  closeSidebar: () => set((state) => ({ ...state, isSidebarOpen: false })),
  setShowSidebarOpen: (value: boolean) => set((state) => ({ ...state, showSidebarOpen: value })),
}));
