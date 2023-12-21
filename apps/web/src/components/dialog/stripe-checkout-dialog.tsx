'use client';

import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useStripeStore } from '@/stores/stripe-store';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function StripeCheckoutDialog() {
  const clientSecret = useStripeStore((state) => state.clientSecret);
  const isStripeCheckoutDialogOpen = useStripeStore((state) => state.isStripeCheckoutDialogOpen);
  const setIsStripeCheckoutDialogOpen = useStripeStore((state) => state.setIsStripeCheckoutDialogOpen);

  if (!clientSecret) return null;

  return (
    <Dialog open={isStripeCheckoutDialogOpen} onOpenChange={setIsStripeCheckoutDialogOpen}>
      <DialogContent className="">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </DialogContent>
    </Dialog>
  );
}
