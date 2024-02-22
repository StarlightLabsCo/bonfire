import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useStripeStore } from '@/stores/stripe-store';
import { useDialogStore } from '@/stores/dialog-store';

export function UserInfo({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } & { id: string };
}) {
  let initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '';

  const [open, setOpen] = useState(false);
  const stripeSubscriptionId = useStripeStore((state) => state.stripeSubscriptionId);
  const createCheckoutSession = useStripeStore((state) => state.createCheckoutSession);
  const createPortalSession = useStripeStore((state) => state.createPortalSession);
  const setIsSettingsDialogOpen = useDialogStore((state) => state.setIsSettingsDialogOpen);

  useEffect(() => {
    async function getStripeSubscriptionStatus() {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      } else {
        if (data.stripeSubscriptionId) {
          useStripeStore.setState({ stripeSubscriptionId: data.stripeSubscriptionId });
        }
      }
    }

    getStripeSubscriptionStatus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 cursor-pointer h-14">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger />
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Community</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                window.open('https://discord.gg/q4SFyvHzwC', '_blank');
              }}
              className="font-light cursor-pointer focus:bg-neutral-800"
            >
              <Icons.discord className="w-3 h-3 mr-2" />
              Discord
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.open('https://twitter.com/starlightlabsco', '_blank');
              }}
              className="font-light cursor-pointer focus:bg-neutral-800"
            >
              <Icons.twitter className="w-3 h-3 mr-2" />
              Twitter
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            {stripeSubscriptionId ? (
              <DropdownMenuItem onClick={() => createPortalSession()} className="font-light cursor-pointer focus:bg-neutral-800">
                <Icons.creditCard className="w-3 h-3 mr-2" />
                Billing
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => createCheckoutSession()} className="font-light cursor-pointer focus:bg-neutral-800">
                <Icons.rocket className="w-3 h-3 mr-2" />
                Upgrade
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)} className="font-light cursor-pointer focus:bg-neutral-800">
              <Icons.gear className="w-3 h-3 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer focus:bg-neutral-800">
            <Icons.exit className="w-3 h-3 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="flex items-center justify-between w-full h-12 p-2 rounded-md hover:bg-neutral-800"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex items-center gap-x-2">
          <Avatar className="w-8 h-8 rounded-md">
            <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-xs font-bold">{user.name}</div>
        </div>
        <div>
          <Icons.moreHorizontal />
        </div>
      </div>
    </div>
  );
}
