import { ToasterToast } from '@/components/ui/use-toast';
import { create } from 'zustand';

type UiStore = {
  toast: ToasterToast | null;
  navigationPath: string | null;
  setToast: (toast: ToasterToast) => void;
  setNavigationPath: (path: string | null) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  toast: null,
  navigationPath: null,
  setToast: (toast) => set({ toast }),
  setNavigationPath: (path) => {
    set({ navigationPath: path });
  },
}));
