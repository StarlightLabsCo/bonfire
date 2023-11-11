import { create } from 'zustand';

type StripeStore = {
  clientSecret: string | null;
  stripeSubscriptionId: string | null;
  setStripeSubscriptionId: (id: string) => void;

  isStripeCheckoutDialogOpen: boolean;
  setIsStripeCheckoutDialogOpen: (open: boolean) => void;

  createCheckoutSession: () => Promise<void>;
  createPortalSession: () => Promise<void>;
};

export const useStripeStore = create<StripeStore>((set) => ({
  clientSecret: null,

  stripeSubscriptionId: null,
  setStripeSubscriptionId: (id: string) => {
    set((state) => ({ ...state, stripeSubscriptionId: id }));
  },

  isStripeCheckoutDialogOpen: false,
  setIsStripeCheckoutDialogOpen: (open: boolean) => {
    set((state) => ({ ...state, isStripeCheckoutDialogOpen: open }));
    if (!open) {
      let count = 0;
      const checkStripeSubscriptionId = async () => {
        count++;

        const response = await fetch('/api/user/', {
          method: 'GET',
        });

        const data = await response.json();

        if (data.stripeSubscriptionId) {
          set((state) => ({ ...state, stripeSubscriptionId: data.stripeSubscriptionId }));
          return;
        }

        if (count < 10) {
          setTimeout(checkStripeSubscriptionId, 1000);
        }
      };
      checkStripeSubscriptionId();
    }
  },

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
