'use client';

import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { cn } from '@/lib/utils';

type ConnectedUsersProps = {
  userId: string;
  className?: string;
};

export function ConnectedUsersDesktop({ userId, className }: ConnectedUsersProps) {
  const currentInstanceId = useCurrentInstanceStore((state) => state.instanceId);
  const connectedRegisteredUsers = useCurrentInstanceStore((state) => state.connectedRegisteredUsers).filter((user) => user.id != userId);
  const connectedAnonymousUsers = useCurrentInstanceStore((state) => state.connectedAnonymousUsers);

  const totalConnectedUsers = connectedRegisteredUsers.length + connectedAnonymousUsers;
  if (!currentInstanceId || totalConnectedUsers === 0) return null;

  const displayUsers = connectedRegisteredUsers.slice(0, 4).map((user) => ({
    ...user,
    isAnonymous: false,
  }));

  const remainingSlots = 4 - displayUsers.length;
  if (remainingSlots > 0 && connectedAnonymousUsers > 0) {
    const anonymousUsersToAdd = Math.min(remainingSlots, connectedAnonymousUsers);
    for (let i = 0; i < anonymousUsersToAdd; i++) {
      displayUsers.push({ id: '', image: null, name: 'Anonymous', isAnonymous: true });
    }
  }

  return (
    <div className={cn('z-20 absolute top-4 right-4 hidden md:flex items-center gap-x-1', className)}>
      {displayUsers.map((user, index) => (
        <HoverCard key={index}>
          <HoverCardTrigger>
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
              <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="p-2">{user.name}</HoverCardContent>
        </HoverCard>
      ))}
      {totalConnectedUsers > 4 && (
        <HoverCard>
          <HoverCardTrigger>
            <div className="h-8 w-8 rounded-full border p-4 border-white/10 flex items-center justify-center">
              +{totalConnectedUsers - 4}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="flex flex-col gap-y-2">
            {connectedRegisteredUsers.slice(4).map((user, index) => (
              <div key={index} className="flex items-center gap-x-2">
                <Avatar className="h-6 w-6 rounded-full">
                  <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
                  <AvatarFallback>{user.name}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
            {connectedAnonymousUsers > 0 && (
              <div className="flex items-center gap-x-2">
                <Avatar className="h-6 w-6 rounded-full">
                  <AvatarFallback>Anonymous</AvatarFallback>
                </Avatar>
                <span className="text-sm">Anonymous x {connectedAnonymousUsers}</span>
              </div>
            )}
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
