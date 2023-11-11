import { getCurrentUser } from '@/lib/session';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/sidebar/sidebar';
import { OutOfCreditsDialog } from '@/components/dialog/outofcredits-dialog';
import { Navigator } from '@/components/navigator';

import db from '@/lib/db';
import { Instance } from '@prisma/client';
import { ShareLinkDialog } from '@/components/dialog/sharelink-dialog';
import { StripeCheckoutDialog } from '@/components/dialog/stripe-checkout-dialog';

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
    <div className="h-full-dvh bg-neutral-950 flex flex-col md:flex-row">
      {user && <Sidebar user={user} instances={instances} />}
      <div className="flex flex-col w-full h-[calc(100%-2.5rem)] max-w-5xl mx-auto">
        <div className="h-full">{children}</div>
      </div>
      <Toaster />
      <OutOfCreditsDialog />
      <ShareLinkDialog />
      <StripeCheckoutDialog />
      <Navigator />
    </div>
  );
}
