import db from '@/lib/db';
import { cache } from 'react';

export const getImages = cache(async () => {
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

  const images = messages.map((message) => message.content).filter((url) => url.startsWith('https://r2.trybonfire.ai'));

  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]]; // Swap elements
  }

  return images;
});
