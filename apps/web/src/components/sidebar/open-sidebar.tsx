'use client';

import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import { useSidebarStore } from '@/stores/sidebar-store';
import { User } from 'next-auth';

export function OpenSidebar({ user }: { user: User | undefined }) {
  const path = usePathname();

  const showSidebarOpen = useSidebarStore((state) => state.showSidebarOpenButton);
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.shiftKey && event.metaKey && event.key === 's') {
        event.preventDefault();
        if (showSidebarOpen) {
          openSidebar();
        } else {
          closeSidebar();
        }
      }
    },
    [closeSidebar, openSidebar, showSidebarOpen],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if ((path == '/' || path.startsWith('/examples')) && typeof user === 'undefined') {
    return null;
  }

  if (showSidebarOpen) {
    return (
      <div
        className="absolute z-20 items-center justify-center hidden h-8 p-2 border rounded-md top-2 left-2 bg-neutral-950 border-white/10 hover:cursor-pointer md:flex"
        onClick={() => openSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    );
  } else {
    return null;
  }
}
