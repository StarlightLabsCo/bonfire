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
  const connectedUsers = useCurrentInstanceStore((state) => state.connectedUsers).filter((user) => user.id != userId);
  if (!currentInstanceId || connectedUsers.length == 0) return null;

  return (
    <div className={cn('md:hidden flex items-center gap-x-1', className)}>
      {connectedUsers.slice(0, 4).map((user, index) => (
        <Avatar key={index} className="h-5 w-5 rounded-full">
          <AvatarImage src={user.image ? user.image : undefined} alt={user.name ? user.name : undefined} />
          <AvatarFallback>{user.name}</AvatarFallback>
        </Avatar>
      ))}
      {connectedUsers.length > 4 && (
        <div className="h-5 w-5 rounded-full border border-white/10 text-[0.5rem] font-light flex items-center justify-center">
          +{connectedUsers.length - 4}
        </div>
      )}
    </div>
  );
}
