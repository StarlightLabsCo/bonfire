'use client';

import { Dialog, DialogContent, DialogContentUnclosable, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/stores/dialog-store';
import { useWebsocketStore } from '@/stores/websocket-store';

export function AnotherOpenTabDialog() {
  const isAnotherOpenTabDialogOpen = useDialogStore((state) => state.isAnotherOpenTabDialogOpen);
  const setIsAnotherOpenTabDialogOpen = useDialogStore((state) => state.setIsAnotherOpenTabDialogOpen);
  const connect = useWebsocketStore((state) => state.connect);

  return (
    <Dialog open={isAnotherOpenTabDialogOpen}>
      <DialogContentUnclosable>
        <DialogHeader>
          <DialogTitle>Only One Tab Allowed</DialogTitle>
          <DialogDescription>
            <div className="mb-5">It looks like Bonfire is already open in another tab or window.</div>

            <Button
              onClick={() => {
                connect();
                setIsAnotherOpenTabDialogOpen(false);
              }}
            >
              Reconnect
            </Button>
          </DialogDescription>
          <DialogDescription className="text-xs pt-5 text-gray-600">(This will disconnect the other tab.)</DialogDescription>
        </DialogHeader>
      </DialogContentUnclosable>
    </Dialog>
  );
}
