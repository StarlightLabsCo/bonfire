import { getCurrentUser } from '@/lib/session';
import Marketing from './marketing';
import Dashboard from './dashboard';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    const mostRecentInstance = await db.instance.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        messages: {
          where: {
            name: 'generate_image',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (mostRecentInstance) {
      return <Dashboard instance={mostRecentInstance} />;
    } else {
      redirect('/lobby');
    }
  } else {
    return <Marketing />;
  }
}
