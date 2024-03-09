import LobbyClient from '@/components/pages/lobby/lobby';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Lobby() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  return <LobbyClient />;
}
