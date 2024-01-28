'use client';

import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { cn } from '@/lib/utils';

type ConnectedUsersProps = {
  className?: string;
};

export function ConnectedUsersDesktop({ className }: ConnectedUsersProps) {
  const currentInstanceId = useCurrentInstanceStore((state) => state.instanceId);
  const connectedUsers = useCurrentInstanceStore((state) => state.connectedUsers);
  if (!currentInstanceId || connectedUsers.length === 0) return null;

  const displayUsers = connectedUsers.slice(0, 4);

  return (
    <div className={cn('z-20 absolute top-4 right-4 hidden md:flex items-center gap-x-1', className)}>
      {displayUsers.map((user, index) => (
        <HoverCard key={index}>
          <HoverCardTrigger>
            <Avatar key={index} className="h-8 w-8 rounded-full">
              <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
              <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="p-2">{user.name}</HoverCardContent>
        </HoverCard>
      ))}
      {connectedUsers.length > 4 && (
        <HoverCard>
          <HoverCardTrigger>
            <div className="h-8 w-8 rounded-full border p-4 border-white/10 flex items-center justify-center">
              +{connectedUsers.length - 4}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="flex flex-col gap-y-2">
            {connectedUsers.slice(4).map((user, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <Avatar className="h-6 w-6 rounded-full">
                  <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
