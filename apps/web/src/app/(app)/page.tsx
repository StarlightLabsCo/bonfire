import { getCurrentUser } from '@/lib/session';
import Marketing from './marketing';
import Lobby from './lobby';

export default async function Home() {
  const user = await getCurrentUser();

  return user ? <Lobby /> : <Marketing />;
}
