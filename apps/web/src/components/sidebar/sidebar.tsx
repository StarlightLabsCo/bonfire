'use client';

import { cn } from '@/lib/utils';
import { Instance } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../contexts/sidebar-context';
import { TopActions } from './top-actions';
import { PastStories } from './past-stories';
import { UserInfo } from './user-info';
import { AudioSidebar } from './audio-sidebar';
import { useEffect, useState } from 'react';
import { Icons } from '../icons';
import { useShareDialog } from '../contexts/share-dialog-context';
import { useWebSocket } from '../contexts/ws-context';

export function Sidebar({
  user,
  instances,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  instances: Instance[];
}) {
  const pathname = usePathname();

  const { isSidebarOpen, setShowSidebarOpen, openSidebar } = useSidebar();
  const { setIsDialogOpen } = useShareDialog();
  const { instanceId } = useWebSocket();

  const [displayedInstances, setDisplayedInstances] =
    useState<Instance[]>(instances);

  const handleTransitionEnd = () => {
    if (!isSidebarOpen) {
      setShowSidebarOpen(true);
    }
  };

  useEffect(() => {
    async function updateDisplayedInstances() {
      const instances = await fetch('/api/instances').then((res) => res.json());
      setDisplayedInstances(instances);
    }

    updateDisplayedInstances();
  }, [pathname]);

  return (
    <>
      {/* Mobile */}
      <div
        className={cn(
          'absolute z-20 w-full max-w-xs h-screen max-h-screen bg-black border-r border-white/10 overflow-auto md:hidden flex flex-col transition-transform duration-200 ease-in-out',
          isSidebarOpen
            ? 'transform translate-x-0'
            : 'transform -translate-x-full',
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <TopActions />
        <PastStories instances={displayedInstances} />
        <AudioSidebar />
        <UserInfo user={user} />
      </div>

      <div
        className={`h-screen w-screen z-10 bg-black/80 fixed top-0 left-0 md:hidden  ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
        }`}
      />
      <div
        className={cn(
          'sticky top-0 z-1 flex items-center justify-between border-b bg-neutral-950 border-white/10 text-gray-200  md:hidden',
        )}
      >
        <button
          className="h-10 w-10 flex-shrink-0 flex items-center justify-center"
          onClick={() => openSidebar()}
        >
          <Icons.hamburger />
        </button>
        <div className="h-10 grow flex items-center justify-center font-sans">
          {/* TODO: title could go here -  make it so it reflects current instance */}
        </div>
        {instanceId && (
          <button
            className="h-10 flex-shrink-0  w-10 flex items-center justify-center"
            onClick={() => setIsDialogOpen(true)}
          >
            <Icons.share />
          </button>
        )}
      </div>

      {/* Desktop */}
      <div
        className={cn(
          'h-full overflow-x-hidden transition-[width] duration-200 flex-shrink-0 hidden md:block',
          isSidebarOpen ? 'w-[250px]' : 'w-0',
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        <div
          className={cn(
            'h-full w-[250px] flex flex-col justify-between items-center bg-black border-r border-white/10',
          )}
        >
          <TopActions />
          <PastStories instances={displayedInstances} />
          <AudioSidebar />
          <UserInfo user={user} />
        </div>
      </div>
    </>
  );
}
