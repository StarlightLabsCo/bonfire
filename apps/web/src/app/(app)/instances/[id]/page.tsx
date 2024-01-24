import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import db from '@/lib/db';
import { Story } from '@/components/pages/story';
import { Metadata } from 'next';

type MetadataProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: MetadataProps) {
  const { id } = params;

  let metadata: Metadata;

  metadata = {
    title: 'Bonfire - Storytelling Reimagined',
    description: 'Created by Starlight Labs',
    metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://www.trybonfire.ai'),
  };

  if (!id) {
    metadata.openGraph = {
      images: ['/bonfire.png'],
    };
  } else {
    metadata.openGraph = {
      images: [`/api/og?instanceId=${id}`],
    };
  }

  return metadata;
}

export default async function Instance({ params }: { params: { id: string } }) {
  const instance = await db.instance.findUnique({
    where: {
      id: params.id,
    },
    include: {
      players: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!instance) {
    redirect('/');
  }

  const user = await getCurrentUser();
  if (!instance.public && (!user || user.id !== instance.userId) && !instance.players.find((p) => p.id === user?.id)) {
    redirect('/');
  }

  const messages = await db.message.findMany({
    where: {
      instanceId: params.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return <Story user={user} instance={instance} dbMessages={messages} />;
}
