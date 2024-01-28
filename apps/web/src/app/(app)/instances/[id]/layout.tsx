import { ConnectedUsersDesktop } from '@/components/connected-users-desktop';

export default async function InstanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConnectedUsersDesktop />
      {children}
    </>
  );
}
