'use client';

import { create } from 'zustand';

type DialogState = {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;

  isCreditsDialogOpen: boolean;
  setIsCreditsDialogOpen: (open: boolean) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  isShareDialogOpen: false,
  setIsShareDialogOpen: (isOpen) => set(() => ({ isShareDialogOpen: isOpen })),

  isCreditsDialogOpen: false,
  setIsCreditsDialogOpen: (open) => set(() => ({ isCreditsDialogOpen: open })),
}));
