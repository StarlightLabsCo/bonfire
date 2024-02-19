import { Toaster } from '@/components/ui/sonner';
import { Navigator } from '@/components/navigator';
import { OpenSidebar } from '@/components/open-sidebar';

import { OutOfCreditsDialog } from '@/components/dialog/outofcredits-dialog';
import { ShareLinkDialog } from '@/components/dialog/sharelink-dialog';
import { StripeCheckoutDialog } from '@/components/dialog/stripe-checkout-dialog';
import { StoreInitializer } from '@/components/store-initializer';
import { DeleteInstanceDialog } from '@/components/dialog/delete-instance-dialog';
import { SettingsDialog } from '@/components/dialog/settings-dialog';
import { InstanceInfoDialog } from '@/components/dialog/instance-info-dialog';
import { SidebarParent } from '@/components/sidebar/sidebar-parent';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <SidebarParent />
      <OpenSidebar />
      {children}
      <Toaster />
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
