import { getCurrentUser } from '@/lib/session';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '@/components/sidebar/sidebar';
import { OutOfCreditsDialog } from '@/components/dialog/outofcredits-dialog';
import { Navigator } from '@/components/navigator';

import db from '@/lib/db';
import { Instance } from '@prisma/client';
import { ShareLinkDialog } from '@/components/dialog/sharelink-dialog';
import { StripeCheckoutDialog } from '@/components/dialog/stripe-checkout-dialog';
import { StoreInitializer } from '@/components/store-initializer';
import { AnotherOpenTabDialog } from '@/components/dialog/another-open-tab-dialog';
import { DeleteInstanceDialog } from '@/components/dialog/delete-instance-dialog';
import { SettingsDialog } from '@/components/dialog/settings-dialog';
import { InstanceInfoDialog } from '@/components/dialog/instance-info-dialog';
import { CreateScenarioDialog } from '@/components/dialog/create-scenario-dialog';
import { OpenSidebar } from '@/components/open-sidebar';

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
      {user && <Sidebar user={user} instances={instances} />}
      {user && <OpenSidebar />}
      {children}
      <Toaster />
      <CreateScenarioDialog />
      <ShareLinkDialog />
      <OutOfCreditsDialog />
      <StripeCheckoutDialog />
      <AnotherOpenTabDialog />
      <InstanceInfoDialog />
      <DeleteInstanceDialog />
      <SettingsDialog />
      <Navigator />
      <StoreInitializer />
    </div>
  );
}
