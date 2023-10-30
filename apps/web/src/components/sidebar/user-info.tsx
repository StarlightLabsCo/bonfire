import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export function UserInfo({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}) {
  let initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '';

  const [open, setOpen] = useState(false);

  return (
    <div className="w-full h-14 px-2 flex flex-col items-center justify-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger />
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => signOut()}>
            Log out
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="w-full h-12 flex items-center justify-between p-2 rounded-md hover:bg-white/10"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex items-center gap-x-2">
          <Avatar className="h-8 w-8 rounded-md">
            <AvatarImage
              src={user.image ? user.image : undefined}
              alt={user.name ? user.name : undefined}
            />
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
