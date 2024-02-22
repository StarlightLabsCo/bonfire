import { getCurrentUser } from '@/lib/session';
import { OpenSidebar } from './open-sidebar';

export async function OpenSidebarParent() {
  const user = await getCurrentUser();

  return <OpenSidebar user={user} />;
}
