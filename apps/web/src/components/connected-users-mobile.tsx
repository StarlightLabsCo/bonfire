'use client';

import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type ConnectedUsersProps = {
  userId: string;
  className?: string;
};

export function ConnectedUsersMobile({ userId, className }: ConnectedUsersProps) {
  const currentInstanceId = useCurrentInstanceStore((state) => state.instanceId);
  const connectedRegisteredUsers = useCurrentInstanceStore((state) => state.connectedRegisteredUsers).filter((user) => user.id != userId);
  const connectedAnonymousUsers = useCurrentInstanceStore((state) => state.connectedAnonymousUsers);

  const totalConnectedUsers = connectedRegisteredUsers.length + connectedAnonymousUsers;
  if (!currentInstanceId || totalConnectedUsers === 0) return null;

  const displayUsers = connectedRegisteredUsers.slice(0, 4).map((user) => ({
    ...user,
    isAnonymous: false,
  }));

  // If there are more than 4 registered users, we only show 4, otherwise fill the remaining slots with anonymous users
  const remainingSlots = 4 - displayUsers.length;
  if (remainingSlots > 0 && connectedAnonymousUsers > 0) {
    const anonymousUsersToAdd = Math.min(remainingSlots, connectedAnonymousUsers);
    for (let i = 0; i < anonymousUsersToAdd; i++) {
      displayUsers.push({ id: '', image: null, name: 'Anonymous', isAnonymous: true });
    }
  }

  return (
    <div className={cn('md:hidden flex items-center gap-x-1', className)}>
      {displayUsers.map((user, index) => (
        <Avatar key={index} className="h-5 w-5 rounded-full fade-in-fast">
          {!user.isAnonymous ? (
            <>
              <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
              <AvatarFallback>{user.name}</AvatarFallback>
            </>
          ) : (
            <AvatarFallback>{user.name}</AvatarFallback>
          )}
        </Avatar>
      ))}
      {totalConnectedUsers > 4 && (
        <div className="h-5 w-5 rounded-full border border-white/10 text-[0.5rem] font-light flex items-center justify-center fade-in-fast">
          +{totalConnectedUsers - 4}
        </div>
      )}
    </div>
  );
}
