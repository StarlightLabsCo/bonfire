import { create } from 'zustand';

type StripeStore = {
  clientSecret: string | null;

  isStripeCheckoutDialogOpen: boolean;
  setIsStripeCheckoutDialogOpen: (open: boolean) => void;

  createCheckoutSession: () => Promise<void>;
  createPortalSession: () => Promise<void>;
};

export const useStripeStore = create<StripeStore>((set) => ({
  clientSecret: null,

  isStripeCheckoutDialogOpen: false,
  setIsStripeCheckoutDialogOpen: (open: boolean) => set((state) => ({ ...state, isStripeCheckoutDialogOpen: open })),

  createCheckoutSession: async () => {
    const response = await fetch('/api/stripe/checkout-session', {
      method: 'POST',
    });

    const data = await response.json();

    set((state) => ({ ...state, clientSecret: data.clientSecret, isStripeCheckoutDialogOpen: true }));
  },

  createPortalSession: async () => {
    const response = await fetch('/api/stripe/portal-session', {
      method: 'POST',
    });

    const data = await response.json();

    window.location.href = data.url;
  },
}));
