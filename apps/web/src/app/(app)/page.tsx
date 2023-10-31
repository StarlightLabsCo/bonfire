import { getCurrentUser } from '@/lib/session';

import { Lobby } from '@/components/pages/lobby';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const messages = await prisma.message.findMany({
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
    const content = JSON.parse(message.content);
    return content['imageURL'];
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
