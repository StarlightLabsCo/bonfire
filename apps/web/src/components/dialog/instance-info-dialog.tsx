'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useDialogStore } from '@/stores/dialog-store';
import { Instance } from 'database';
import { useEffect, useState } from 'react';

export function InstanceInfoDialog() {
  const isInstanceInfoDialogOpen = useDialogStore((state) => state.isInstanceInfoDialogOpen);
  const setIsInstanceInfoDialogOpen = useDialogStore((state) => state.setIsInstanceInfoDialogOpen);

  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

  const [instance, setInstance] = useState<Instance | null>(null);

  useEffect(() => {
    const fetchInstance = async () => {
      if (!instanceId) return;

      const instance = await fetch(`/api/instances/${instanceId}`).then((res) => res.json());

      setInstance(instance);
    };

    fetchInstance();
  }, [instanceId]);

  return (
    <Dialog open={isInstanceInfoDialogOpen} onOpenChange={setIsInstanceInfoDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instance Info</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col w-full">
              <div className="flex justify-between">
                <span className="font-bold">Created:</span>
                <span>{instance?.createdAt && new Date(instance?.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Updated:</span>
                <span>{instance?.updatedAt && new Date(instance?.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-y-2">
                <span className="font-bold self-start">Prompt:</span>
                <span className="text-left">{instance?.description}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
