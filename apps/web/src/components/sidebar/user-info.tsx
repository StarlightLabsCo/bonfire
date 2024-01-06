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
import { useWebsocketStore } from '@/stores/websocket-store';
import { StarlightWebSocketRequestType } from 'websocket';

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

  // TODO: Remove these.
  const setIsCreateScenarioDialogOpen = useDialogStore((state) => state.setIsCreateScenarioDialogOpen);
  const sendToServer = useWebsocketStore((state) => state.sendToServer);

  const createInstanceFromTemplate = () => {
    sendToServer({
      type: StarlightWebSocketRequestType.createInstance,
      data: {
        instanceTemplateId: 'clr1hughd0018xzagunam4s3f',
        description: null,
      },
    });
  };
  // TODO END

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
    <div className="w-full h-14 px-2 flex flex-col items-center justify-center cursor-pointer">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger />
        <DropdownMenuContent className="w-56">
          {/* DEBUG. TODO: Remove. */}
          <DropdownMenuLabel>Debug</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsCreateScenarioDialogOpen(true)} className="font-light cursor-pointer focus:bg-neutral-800">
            <Icons.gear className="mr-2 h-3 w-3" />
            Create Scenario
          </DropdownMenuItem>
          <DropdownMenuItem onClick={createInstanceFromTemplate} className="font-light cursor-pointer focus:bg-neutral-800">
            <Icons.gear className="mr-2 h-3 w-3" />
            Create Story from Scenario
          </DropdownMenuItem>
          <DropdownMenuLabel>Community</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                window.open('https://discord.gg/q4SFyvHzwC', '_blank');
              }}
              className="font-light cursor-pointer focus:bg-neutral-800"
            >
              <Icons.discord className="mr-2 h-3 w-3" />
              Discord
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.open('https://twitter.com/starlightlabsco', '_blank');
              }}
              className="font-light cursor-pointer focus:bg-neutral-800"
            >
              <Icons.twitter className="mr-2 h-3 w-3" />
              Twitter
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            {stripeSubscriptionId ? (
              <DropdownMenuItem onClick={() => createPortalSession()} className="font-light cursor-pointer focus:bg-neutral-800">
                <Icons.creditCard className="mr-2 h-3 w-3" />
                Billing
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => createCheckoutSession()} className="font-light cursor-pointer focus:bg-neutral-800">
                <Icons.rocket className="mr-2 h-3 w-3" />
                Upgrade
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)} className="font-light cursor-pointer focus:bg-neutral-800">
              <Icons.gear className="mr-2 h-3 w-3" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer focus:bg-neutral-800">
            <Icons.exit className="mr-2 h-3 w-3" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="w-full h-12 flex items-center justify-between p-2 rounded-md hover:bg-neutral-800"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex items-center gap-x-2">
          <Avatar className="h-8 w-8 rounded-md">
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
