'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useDialogStore } from '@/stores/dialog-store';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

export function ShareLinkDialog() {
  const canShare = typeof navigator !== 'undefined' && navigator.share;
  const isShareDialogOpen = useDialogStore((state) => state.isShareDialogOpen);
  const setIsShareDialogOpen = useDialogStore((state) => state.setIsShareDialogOpen);
  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

  // Inviting Players
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(false);
  const submitValue = async () => {
    if (!instanceId) return;
    if (disabled) return;
    if (!value) return;

    setDisabled(true);

    const email = value;

    const response = await fetch(`/api/instances/${instanceId}/players`, {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    });

    if (response.status !== 200) {
      toast.error('Unable to invite player to instance.');
      setDisabled(false);
      return;
    }

    const players = await response.json();

    setValue('');
    setPlayers(players);

    toast.success('Player invited to instance.');
    setDisabled(false);
  };

  const [players, setPlayers] = useState<
    {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    }[]
  >([]);

  const removePlayerFromInstance = async (playerId: string) => {
    const playerToRemove = players.find((player) => player.id === playerId);
    if (!playerToRemove) return;

    setPlayers(players.filter((player) => player.id !== playerId));

    const response = await fetch(`/api/instances/${instanceId}/players/${playerId}`, {
      method: 'DELETE',
    });

    if (response.status !== 200) {
      setPlayers([...players, playerToRemove]);

      toast.error('Unable to remove player from instance.');
      return;
    }
  };

  // Global Observers
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
        toast.error('Unable to make instance public.');
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
        toast.error('Unable to make instance private.');
        return;
      }
    }
  };

  useEffect(() => {
    if (instanceId) {
      const getInstanceStatus = async () => {
        const response = await fetch(`/api/instances/${instanceId}`);

        if (response.status !== 200) {
          return;
        }

        const { public: isInstancePublic, players } = await response.json();

        setChecked(isInstancePublic);
        setPlayers(players);
      };

      getInstanceStatus();
    }
  }, [instanceId]);

  const copyLink = async () => {
    try {
      const link = `${window.location.origin}/instances/${instanceId}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard.');
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col w-full gap-y-8">
            <div className="flex flex-col w-full gap-y-4">
              <div>
                <div className="font-bold text-lg">Invite companions to your adventure</div>
                <div className="font-light text-sm text-white/50">
                  Bring friends into your story to decide the fate of your journey together
                </div>
              </div>
              <div className="w-full flex items-center px-4 py-2 border-[0.5px] border-white/20 bg-neutral-900 rounded-2xl disabled:cursor-not-allowed disabled:opacity-50">
                <input
                  placeholder="Add players by email"
                  className="w-full py-2 text-sm placeholder:text-neutral-500 bg-neutral-900 focus:outline-none"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      submitValue();
                    }
                  }}
                  disabled={disabled}
                />
                <Icons.magnifyingGlass
                  className={'w-4 h-4 cursor-pointer text-neutral-500'}
                  onClick={() => {
                    submitValue();
                  }}
                />
              </div>
              {players && players.length > 0 && (
                <div className="flex flex-col gap-y-3">
                  {players.map((player, index) => (
                    <div key={index} className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-x-4">
                        {player.image ? (
                          <Avatar className="w-6 h-6 rounded-full">
                            <AvatarImage src={player.image} alt={player.name ? player.name : undefined} />
                            <AvatarFallback>{player.name}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Icons.person className="w-6 h-6 text-neutral-500" />
                        )}
                        <div className="flex flex-col">
                          <div className="text-sm text-left">{player.name}</div>
                          <div className="text-xs text-left text-white/50">{player.email}</div>
                        </div>
                      </div>
                      <Icons.cross
                        className="w-4 h-4 text-neutral-500 hover:text-neutral-200 cursor-pointer"
                        onClick={() => removePlayerFromInstance(player.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col w-full gap-y-4">
              <div>
                <div className="font-bold text-lg">Spread the tales of your journey</div>
                <div className="font-light text-sm text-white/50">
                  Use this link to share your adventure with the world. Observers can watch, but not participate.
                </div>
              </div>
              <div className="flex items-center gap-x-2 text-white">
                <Switch checked={checked} onCheckedChange={setInstancePublic} />
                {checked ? 'Public' : 'Private'}
              </div>
            </div>
            {canShare ? (
              <Button
                variant={'outline'}
                className="bg-neutral-950 border-white/10 hover:bg-neutral-800"
                onClick={() => {
                  navigator.share({
                    title: 'Bonfire',
                    url: `${window.location.origin}/instances/${instanceId}`,
                  });
                }}
              >
                Share Link
              </Button>
            ) : (
              <Button variant={'outline'} className="bg-neutral-950 border-white/10 hover:bg-neutral-800" onClick={copyLink}>
                Copy Link
              </Button>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
