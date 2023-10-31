import { create } from 'zustand';

type ShareDialogStore = {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
};

export const useShareDialogStore = create<ShareDialogStore>((set) => ({
  isDialogOpen: false,
  setIsDialogOpen: (isOpen: boolean) => set({ isDialogOpen: isOpen }),
}));
