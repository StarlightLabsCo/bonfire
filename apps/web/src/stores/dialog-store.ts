'use client';

import { create } from 'zustand';

type DialogState = {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;

  isCreditsDialogOpen: boolean;
  setIsCreditsDialogOpen: (open: boolean) => void;

  isDeleteInstanceDialogOpen: boolean;
  setIsDeleteInstanceDialogOpen: (open: boolean) => void;

  isSettingsDialogOpen: boolean;
  setIsSettingsDialogOpen: (open: boolean) => void;

  isInstanceInfoDialogOpen: boolean;
  setIsInstanceInfoDialogOpen: (open: boolean) => void;

  isSetNarratorDialogOpen: boolean;
  setIsSetNarratorDialogOpen: (open: boolean) => void;

  isSetStoryOutlineDialogOpen: boolean;
  setIsSetStoryOutlineDialogOpen: (open: boolean) => void;

  isSetImageStyleDialogOpen: boolean;
  setIsSetImageStyleDialogOpen: (open: boolean) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  isShareDialogOpen: false,
  setIsShareDialogOpen: (open) => set(() => ({ isShareDialogOpen: open })),

  isCreditsDialogOpen: false,
  setIsCreditsDialogOpen: (open) => set(() => ({ isCreditsDialogOpen: open })),

  isDeleteInstanceDialogOpen: false,
  setIsDeleteInstanceDialogOpen: (open) => set(() => ({ isDeleteInstanceDialogOpen: open })),

  isSettingsDialogOpen: false,
  setIsSettingsDialogOpen: (open) => set(() => ({ isSettingsDialogOpen: open })),

  isInstanceInfoDialogOpen: false,
  setIsInstanceInfoDialogOpen: (open) => set(() => ({ isInstanceInfoDialogOpen: open })),

  isSetNarratorDialogOpen: false,
  setIsSetNarratorDialogOpen: (open) => set(() => ({ isSetNarratorDialogOpen: open })),

  isSetStoryOutlineDialogOpen: false,
  setIsSetStoryOutlineDialogOpen: (open) => set(() => ({ isSetStoryOutlineDialogOpen: open })),

  isSetImageStyleDialogOpen: false,
  setIsSetImageStyleDialogOpen: (open) => set(() => ({ isSetImageStyleDialogOpen: open })),
}));
