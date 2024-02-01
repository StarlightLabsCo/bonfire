import { getSession } from '@/lib/session';
import db from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
  }

  const instances = await db.instance.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return new Response(JSON.stringify(instances), {
    headers: {
      'content-type': 'application/json',
    },
  });
}
