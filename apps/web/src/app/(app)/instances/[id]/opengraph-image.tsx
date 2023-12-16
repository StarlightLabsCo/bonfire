import { createClient } from '@vercel/postgres';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Bonfire - Storytelling Reimagined';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  console.log(`Generating image for instance ${params.id}`);
  const client = createClient({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  console.log(`Connected to database.`);
  const { rows } = await client.query(
    `
    SELECT m.content
    FROM "Message" m
    INNER JOIN "Instance" i ON m."instanceId" = i.id
    WHERE m."instanceId" = $1
    AND m.role = 'function'
    AND m.name = 'generate_image'
    AND i.public = true
    AND m.content LIKE 'https://%'
    ORDER BY m."createdAt" ASC
    LIMIT 1
  `,
    [params.id],
  );

  const result = rows[0];

  if (!result) {
    throw new Error('Image not found');
  }

  await client.end();

  return new ImageResponse(<img src={result.content} alt={alt} width={size.width} height={size.height} />, {
    ...size,
  });
}
