import { ImageResponse } from 'next/og';
import { Pool } from 'pg';

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

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const { rows } = await pool.query(
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
    return new ImageResponse(<img src="/bonfire.png" alt={alt} width={width} height={height} />, {
      width,
      height,
    });
  }

  pool.end(); // TODO: put this in a ctx.WaitUntil for better performance

  return new ImageResponse(<img src={result.content} alt={alt} width={width} height={height} />, {
    width,
    height,
  });
}
