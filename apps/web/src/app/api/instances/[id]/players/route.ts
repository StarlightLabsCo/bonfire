import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Auth
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.redirect('/login');
  }

  const instance = await db.instance.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!instance) {
    return new Response(null, {
      status: 404,
    });
  }

  if (instance.userId !== session.user.id) {
    return new Response(null, {
      status: 403,
    });
  }

  // Find the user to add
  const { email } = await request.json();
  if (!email) {
    return new Response(null, {
      status: 400,
    });
  }

  const userToAdd = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!userToAdd) {
    return new Response(null, {
      status: 404,
    });
  }

  const updatedInstance = await db.instance.update({
    where: {
      id: params.id,
    },
    data: {
      players: {
        connect: {
          id: userToAdd.id,
        },
      },
    },
    include: {
      players: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (updatedInstance && updatedInstance.players) {
    return new Response(JSON.stringify(updatedInstance.players), {
      headers: {
        'content-type': 'application/json',
      },
    });
  } else {
    return new Response(null, {
      status: 404,
    });
  }
}