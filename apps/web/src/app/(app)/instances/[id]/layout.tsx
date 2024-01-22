import { ConnectedUsersDesktop } from '@/components/connected-users-desktop';
import { getCurrentUser } from '@/lib/session';

export default async function InstanceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      {user && <ConnectedUsersDesktop userId={user.id} />}
      {children}
    </>
  );
}
