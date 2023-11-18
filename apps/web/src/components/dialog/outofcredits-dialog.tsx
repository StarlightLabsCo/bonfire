'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/stores/dialog-store';
import { useStripeStore } from '@/stores/stripe-store';

export function OutOfCreditsDialog() {
  const isCreditsDialogOpen = useDialogStore((state) => state.isCreditsDialogOpen);
  const setIsCreditsDialogOpen = useDialogStore((state) => state.setIsCreditsDialogOpen);
  const createCheckoutSession = useStripeStore((state) => state.createCheckoutSession);

  return (
    <Dialog open={isCreditsDialogOpen} onOpenChange={setIsCreditsDialogOpen}>
      <DialogContent className="bg-neutral-950 border-white/10">
        <DialogHeader>
          <DialogTitle>Want to continue the adventure?</DialogTitle>
          <DialogDescription>
            <div className="mb-5">Upgrade to the premium tier to continue today.</div>

            <Button
              onClick={async () => {
                await createCheckoutSession();
                setIsCreditsDialogOpen(false);
              }}
            >
              Subscribe
            </Button>
          </DialogDescription>
          <DialogDescription className="text-xs pt-5 text-gray-600">
            (We&apos;ve unfortunately run out of free credits to give you.)
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
