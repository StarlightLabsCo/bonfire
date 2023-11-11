import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.redirect('/login');
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new Response(null, {
      status: 404,
    });
  }

  return new Response(JSON.stringify(user), {
    headers: {
      'content-type': 'application/json',
    },
  });
}
