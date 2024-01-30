import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function DELETE(request: Request, { params }: { params: { id: string; playerId: string } }) {
  const session = await getSession();

  if (!session || !session.user) {
    return new Response(null, {
      status: 401,
    });
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

  const updatedInstance = await db.instance.update({
    where: {
      id: params.id,
    },
    data: {
      players: {
        disconnect: {
          id: params.playerId,
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
