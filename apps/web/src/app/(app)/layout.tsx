import db from '@/lib/db';
import { Instance } from '@prisma/client';
import { getCurrentUser } from '@/lib/session';

import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/sidebar/sidebar';
import { Navigator } from '@/components/navigator';
import { OpenSidebar } from '@/components/open-sidebar';

import { OutOfCreditsDialog } from '@/components/dialog/outofcredits-dialog';
import { ShareLinkDialog } from '@/components/dialog/sharelink-dialog';
import { StripeCheckoutDialog } from '@/components/dialog/stripe-checkout-dialog';
import { StoreInitializer } from '@/components/store-initializer';
import { DeleteInstanceDialog } from '@/components/dialog/delete-instance-dialog';
import { SettingsDialog } from '@/components/dialog/settings-dialog';
import { InstanceInfoDialog } from '@/components/dialog/instance-info-dialog';
import { SetImageStyleDialog } from '@/components/dialog/set-image-style-dialog';
import { SetStoryOutlineDialog } from '@/components/dialog/set-story-outline-dialog';
import { SetNarratorDialog } from '@/components/dialog/set-narrator-dialog';

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
    <div className="bg-neutral-950 flex flex-col md:flex-row">
      <Sidebar user={user} instances={instances} />
      <OpenSidebar />
      {children}
      <Toaster />
      <SetNarratorDialog />
      <SetStoryOutlineDialog />
      <SetImageStyleDialog />
      <ShareLinkDialog />
      <OutOfCreditsDialog />
      <StripeCheckoutDialog />
      <InstanceInfoDialog />
      <DeleteInstanceDialog />
      <SettingsDialog />
      <Navigator />
      <StoreInitializer />
    </div>
  );
}
