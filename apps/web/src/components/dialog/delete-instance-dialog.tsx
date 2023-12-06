'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDialogStore } from '@/stores/dialog-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function DeleteInstanceDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);
  const isDeleteInstanceDialogOpen = useDialogStore((state) => state.isDeleteInstanceDialogOpen);
  const setIsDeleteInstanceDialogOpen = useDialogStore((state) => state.setIsDeleteInstanceDialogOpen);

  const handleDeleteInstance = async () => {
    const res = await fetch(`/api/instances/${instanceId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setIsDeleteInstanceDialogOpen(false);
    }

    if (pathname === `/instances/${instanceId}`) {
      router.push('/');
    }
  };

  return (
    <Dialog open={isDeleteInstanceDialogOpen} onOpenChange={setIsDeleteInstanceDialogOpen}>
      <DialogContent className="bg-neutral-950 border-white/10">
        <DialogHeader>
          <DialogTitle>Delete Story?</DialogTitle>
          <DialogDescription>
            <div className="mb-5">This can not be undone.</div>

            <Button variant="destructive" onClick={handleDeleteInstance}>
              Delete
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
