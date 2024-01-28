'use client';

import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type ConnectedUsersProps = {
  className?: string;
};

export function ConnectedUsersMobile({ className }: ConnectedUsersProps) {
  const currentInstanceId = useCurrentInstanceStore((state) => state.instanceId);
  const connectedUsers = useCurrentInstanceStore((state) => state.connectedUsers);
  if (!currentInstanceId || connectedUsers.length === 0) return null;

  const displayUsers = connectedUsers.slice(0, 4);

  return (
    <div className={cn('md:hidden flex items-center gap-x-1', className)}>
      {displayUsers.map((user, index) => (
        <Avatar key={index} className="h-5 w-5 rounded-full fade-in-fast">
          <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
      ))}
      {connectedUsers.length > 4 && (
        <div className="h-5 w-5 rounded-full border border-white/10 text-[0.5rem] font-light flex items-center justify-center fade-in-fast">
          +{connectedUsers.length - 4}
        </div>
      )}
    </div>
  );
}
