'use client';

import { create } from 'zustand';

type DialogState = {
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (isOpen: boolean) => void;

  isCreditsDialogOpen: boolean;
  setIsCreditsDialogOpen: (open: boolean) => void;

  isAnotherOpenTabDialogOpen: boolean;
  setIsAnotherOpenTabDialogOpen: (open: boolean) => void;

  isDeleteInstanceDialogOpen: boolean;
  setIsDeleteInstanceDialogOpen: (open: boolean) => void;

  isSettingsDialogOpen: boolean;
  setIsSettingsDialogOpen: (open: boolean) => void;

  isInstanceInfoDialogOpen: boolean;
  setIsInstanceInfoDialogOpen: (open: boolean) => void;

  isCreateScenarioDialogOpen: boolean;
  setIsCreateScenarioDialogOpen: (open: boolean) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  isShareDialogOpen: false,
  setIsShareDialogOpen: (open) => set(() => ({ isShareDialogOpen: open })),

  isCreditsDialogOpen: false,
  setIsCreditsDialogOpen: (open) => set(() => ({ isCreditsDialogOpen: open })),

  isAnotherOpenTabDialogOpen: false,
  setIsAnotherOpenTabDialogOpen: (open) => set(() => ({ isAnotherOpenTabDialogOpen: open })),

  isDeleteInstanceDialogOpen: false,
  setIsDeleteInstanceDialogOpen: (open) => set(() => ({ isDeleteInstanceDialogOpen: open })),

  isSettingsDialogOpen: false,
  setIsSettingsDialogOpen: (open) => set(() => ({ isSettingsDialogOpen: open })),

  isInstanceInfoDialogOpen: false,
  setIsInstanceInfoDialogOpen: (open) => set(() => ({ isInstanceInfoDialogOpen: open })),

  isCreateScenarioDialogOpen: false,
  setIsCreateScenarioDialogOpen: (open) => set(() => ({ isCreateScenarioDialogOpen: open })),
}));
