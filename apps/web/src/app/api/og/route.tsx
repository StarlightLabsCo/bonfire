import { ImageResponse } from 'next/og';
import { Pool } from '@neondatabase/serverless';

export const runtime = 'edge';

const alt = 'Bonfire - Storytelling Reimagined';
const width = 1200;
const height = 630;

export async function GET(request: Request, ctx: any) {
  const { searchParams } = new URL(request.url);
  const instanceId = searchParams.get('instanceId');
  if (!instanceId || process.env.DATABASE_URL === undefined) {
    return new ImageResponse(<img src="/bonfire.png" alt={alt} width={width} height={height} />, {
      width,
      height,
    });
  }

  console.log(`Generating image for instance ${instanceId}`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.connect();

  console.log(`Connected to database.`);

  const query = `
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
  `;
  const params = [instanceId];

  const { rows } = await pool.query(query, params);

  const result = rows[0];

  if (!result) {
    console.log(`No image found for instance ${instanceId}`);
    return new ImageResponse(<img src="/bonfire.png" alt={alt} width={width} height={height} />, {
      width,
      height,
    });
  }

  ctx.waitUntil(pool.end());

  console.log(`Found image: ${result.content}`);
  return new ImageResponse(<img src={result.content} alt={alt} width={width} height={height} />, {
    width,
    height,
  });
}
