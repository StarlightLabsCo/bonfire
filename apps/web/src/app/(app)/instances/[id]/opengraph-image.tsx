import { ImageResponse } from 'next/og';
import { createPool } from '@vercel/postgres';

export const runtime = 'edge';

export const alt = 'Bonfire - Storytelling Reimagined';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const pool = createPool({
  connectionString: process.env.DIRECT_URL,
});

export default async function Image({ params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    `
    SELECT m.content
    FROM "Message" m
    INNER JOIN "Instance" i ON m.instanceId = i.id
    WHERE m.instanceId = $1
    AND m.role = 'function'
    AND m.name = 'generate_image'
    AND i.public = true
    AND m.content LIKE 'https://%'
    ORDER BY m.createdAt ASC
    LIMIT 1
  `,
    [params.id],
  );

  const image = rows[0];

  if (!image) {
    throw new Error('Image not found');
  }

  return new ImageResponse(<img src={image.content} alt={alt} width={size.width} height={size.height} />, {
    ...size,
  });
}
