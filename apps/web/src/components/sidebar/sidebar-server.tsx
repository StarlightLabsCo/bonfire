import db from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { Sidebar } from './sidebar';
import { Instance } from 'database';

export async function SidebarServer() {
  const user = await getCurrentUser();

  let instances: Instance[] = [];
  if (user) {
    instances = await db.instance.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  return <Sidebar user={user} instances={instances} />;
}
