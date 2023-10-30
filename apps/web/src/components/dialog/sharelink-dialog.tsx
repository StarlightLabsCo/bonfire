'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useWebSocket } from '../contexts/ws-context';
import { useToast } from '../ui/use-toast';
import { useShareDialog } from '../contexts/share-dialog-context';

type ShareLinkDialogProps = {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
};

export function ShareLinkDialog() {
  const { instanceId } = useWebSocket();
  const { toast } = useToast();

  const { isDialogOpen, setIsDialogOpen } = useShareDialog();

  const [checked, setChecked] = useState(false);

  const setInstancePublic = async (isInstancePublic: boolean) => {
    if (isInstancePublic) {
      setChecked(true);

      const response = await fetch(`/api/instances/${instanceId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          public: true,
        }),
      });

      if (response.status !== 200) {
        setChecked(false);
        toast({
          title: 'Error',
          description: 'Unable to make instance public.',
        });
        return;
      }
    } else {
      setChecked(false);

      const response = await fetch(`/api/instances/${instanceId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          public: false,
        }),
      });

      if (response.status !== 200) {
        setChecked(true);
        toast({
          title: 'Error',
          description: 'Unable to make instance private.',
        });
        return;
      }
    }
  };

  const getInstanceStatus = async () => {
    const response = await fetch(`/api/instances/${instanceId}`);

    if (response.status !== 200) {
      return;
    }

    const { public: isInstancePublic } = await response.json();

    setChecked(isInstancePublic);
  };

  useEffect(() => {
    if (instanceId) {
      getInstanceStatus();
    }
  }, [instanceId]);

  const link = `https://bonfire.starlightlabs.co/instances/${instanceId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link.',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="bg-black">
        <DialogHeader>
          <DialogTitle>Spread the tales of your journey</DialogTitle>
          <DialogDescription>
            <div className="mb-5">
              Share this link with your friends to let them view your story.
            </div>
            <div className="flex flex-col w-28 gap-y-4">
              <div className="flex items-center gap-x-2 text-white">
                <Switch checked={checked} onCheckedChange={setInstancePublic} />
                {checked ? 'Public' : 'Private'}
              </div>
              <Button
                variant={'outline'}
                disabled={!checked}
                onClick={copyLink}
              >
                Copy Link
              </Button>
            </div>
          </DialogDescription>
          <DialogDescription className="text-xs pt-5 text-gray-600">
            ( Heads up! Anyone with this link can view past and future messages.
            )
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
