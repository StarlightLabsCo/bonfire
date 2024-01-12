import { Lobby } from '@/components/pages/lobby';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // TODO: add suspend barrier for this data
  const messages = await db.message.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      role: 'function',
      name: 'generate_image',
    },
    take: 30,
  });

  // only give images that are generate_image
  const images = messages.map((message) => {
    return message.content;
  });

  // shuffle images
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = images[i];
    images[i] = images[j];
    images[j] = temp;
  }

  return <Lobby user={user} imageUrls={images} />;
}
