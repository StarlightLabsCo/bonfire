'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/stores/dialog-store';

export function SettingsDialog() {
  const isSettingsDialogOpen = useDialogStore((state) => state.isSettingsDialogOpen);
  const setIsSettingsDialogOpen = useDialogStore((state) => state.setIsSettingsDialogOpen);

  return (
    <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            <div className="mb-5">Beep boop.</div>

            <Button onClick={() => {}}>Settings</Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
