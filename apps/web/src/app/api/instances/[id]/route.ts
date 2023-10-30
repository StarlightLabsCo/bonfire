import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  return new Response(JSON.stringify(instance), {
    headers: {
      'content-type': 'application/json',
    },
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

  const body = await request.json();
  if (!body) {
    return new Response(null, {
      status: 400,
    });
  }

  if (body.public != null && typeof body.public === 'boolean') {
    let response = await db.instance.update({
      where: {
        id: params.id,
      },
      data: {
        public: body.public,
      },
    });

    if (!response) {
      return new Response(null, {
        status: 500,
      });
    }

    return new Response(null, {
      status: 200,
    });
  } else {
    return new Response(null, {
      status: 400,
    });
  }
}
