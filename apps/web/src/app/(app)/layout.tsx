import { getCurrentUser } from '@/lib/session';
import { Toaster } from '@/components/ui/toaster';
import { WebSocketProvider } from '@/components/contexts/ws-context';
import { PlaybackContextProvider } from '@/components/contexts/audio/playback-context';
import { MessagesProvider } from '@/components/contexts/messages-context';
import { Sidebar } from '@/components/sidebar/sidebar';
import { OutOfCreditsDialogProvider } from '@/components/contexts/dialog/credits-dialog-context';
import { OutOfCreditsDialog } from '@/components/dialog/outofcredits-dialog';

import db from '@/lib/db';
import { Instance } from '@prisma/client';
import { ShareLinkDialog } from '@/components/dialog/sharelink-dialog';
import { TranscriptionContextProvider } from '@/components/contexts/audio/transcription-context';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  let instances: Instance[] = [];
  if (user) {
    instances = await db.instance.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  return (
    <WebSocketProvider>
      <PlaybackContextProvider>
        <TranscriptionContextProvider>
          <MessagesProvider>
            <OutOfCreditsDialogProvider>
              <div className="h-screen bg-neutral-950 flex flex-col md:flex-row">
                {user && <Sidebar user={user} instances={instances} />}
                <div className="flex flex-col w-full h-[calc(100%-2.5rem)] max-w-5xl mx-auto">
                  <div className="h-full">{children}</div>
                </div>
                <Toaster />
                <OutOfCreditsDialog />
                <ShareLinkDialog />
              </div>
            </OutOfCreditsDialogProvider>
          </MessagesProvider>
        </TranscriptionContextProvider>
      </PlaybackContextProvider>
    </WebSocketProvider>
  );
}
