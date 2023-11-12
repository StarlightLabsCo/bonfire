'use client';

import { create } from 'zustand';

type AdventureSuggestionsStore = {
  adventureSuggestions: string[];
  setAdventureSuggestions: (adventureSuggestions: string[]) => void;
};

export const useAdventureSuggestionsStore = create<AdventureSuggestionsStore>((set) => ({
  adventureSuggestions: [],
  setAdventureSuggestions: (adventureSuggestions: string[]) => set({ adventureSuggestions }),
}));
