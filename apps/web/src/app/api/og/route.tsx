import { ImageResponse } from 'next/og';
import { createClient } from '@vercel/postgres';

export const runtime = 'edge';

const alt = 'Bonfire - Storytelling Reimagined';
const width = 1200;
const height = 630;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instanceId = searchParams.get('instanceId');
  if (!instanceId) {
    return new ImageResponse(<img src="/bonfire.png" alt={alt} width={width} height={height} />, {
      width,
      height,
    });
  }

  console.log(`Generating image for instance ${instanceId}`);
  const client = createClient({
    connectionString: process.env.DATABASE_URL,
  });

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
    [instanceId],
  );

  const result = rows[0];

  if (!result) {
    console.log(`No image found for instance ${instanceId}`);
    return new ImageResponse(<img src="/bonfire.png" alt={alt} width={width} height={height} />, {
      width,
      height,
    });
  }

  await client.end();

  console.log(`Found image: ${result.content}`);
  return new ImageResponse(<img src={result.content} alt={alt} width={width} height={height} />, {
    width,
    height,
  });
}
