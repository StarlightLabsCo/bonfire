'use client';

import { cn } from '@/lib/utils';
import { Instance } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { TopActions } from './top-actions';
import { PastStories } from './past-stories';
import { UserInfo } from './user-info';
import { AudioSidebar } from './audio-sidebar';
import { useEffect, useState } from 'react';
import { Icons } from '../icons';

import { useSidebarStore } from '@/stores/sidebar-store';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useDialogStore } from '@/stores/dialog-store';
import { ConnectedUsersMobile } from '../connected-users-mobile';
import { User } from 'next-auth';
import { CallToAction } from './call-to-action';

export function Sidebar({ user, instances }: { user: User | undefined; instances: Instance[] }) {
  const pathname = usePathname();

  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const setShowSidebarOpen = useSidebarStore((state) => state.setShowSidebarOpenButton);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const mobileHeaderHeight = useSidebarStore((state) => state.mobileHeaderHeight);

  const setIsShareDialogOpen = useDialogStore((state) => state.setIsShareDialogOpen);

  const instanceId = useCurrentInstanceStore((state) => state.instanceId);

  const [displayedInstances, setDisplayedInstances] = useState<Instance[]>(instances);

  const handleTransitionEnd = () => {
    if (!isSidebarOpen) {
      setShowSidebarOpen(true);
    }
  };

  async function updateDisplayedInstances() {
    const instances = await fetch('/api/instances').then((res) => {
      if (!res.ok) {
        console.error('Failed to fetch instances: ', res.status, res.statusText);
        return [];
      }
      return res.json();
    });

    setDisplayedInstances(instances);
  }

  useEffect(() => {
    updateDisplayedInstances();
  }, [pathname]);

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'absolute z-20 w-full max-w-xs h-[100dvh] max-h-[100dvh] bg-black border-r border-white/10 overflow-auto md:hidden flex flex-col transition-transform duration-200 ease-in-out',
          isSidebarOpen ? 'transform translate-x-0' : 'transform -translate-x-full',
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <TopActions />
        {typeof user !== 'undefined' ? <PastStories instances={displayedInstances} /> : <CallToAction />}
        <AudioSidebar />
        {typeof user !== 'undefined' && <UserInfo user={user} />}
      </div>

      {/* Mobile Background Overlay */}
      <div
        onClick={() => closeSidebar()}
        onTouchStart={() => closeSidebar()}
        className={`h-[100dvh] w-screen z-[15] bg-black/80 fixed top-0 left-0 md:hidden  ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
        }`}
      />

      {/* Mobile Header */}
      <div
        className={`absolute h-10 z-10 w-full flex items-center justify-between ${instanceId ? 'border-b bg-neutral-950 border-white/10' : ''} text-gray-200 md:hidden`}
        style={{ top: `${mobileHeaderHeight}px` }}
      >
        <button className="h-10 w-10 flex-shrink-0 flex items-center justify-center" onClick={() => openSidebar()}>
          <Icons.hamburger />
        </button>
        <div className="h-10 grow flex items-center justify-center font-sans">
          {/* TODO: title could go here -  make it so it reflects current instance */}
        </div>
        <div className="flex items-center">
          <ConnectedUsersMobile />
          {instanceId && (
            <button className="h-10 flex-shrink-0 w-10 flex items-center justify-center" onClick={() => setIsShareDialogOpen(true)}>
              <Icons.share />
            </button>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div
        className={cn(
          'h-[100dvh] overflow-x-hidden transition-[width] duration-200 flex-shrink-0 hidden md:block',
          isSidebarOpen ? 'w-[250px]' : 'w-0',
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={cn('h-full w-[250px] flex flex-col justify-between items-center bg-black border-r border-white/10')}>
          <TopActions />
          {typeof user !== 'undefined' ? <PastStories instances={displayedInstances} /> : <CallToAction />}
          <AudioSidebar />
          {typeof user !== 'undefined' && <UserInfo user={user} />}
        </div>
      </div>
    </>
  );
}
