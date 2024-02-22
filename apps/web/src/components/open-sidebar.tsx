'use client';

import { useCallback, useEffect } from 'react';
import { Icons } from './icons';
import { useSidebarStore } from '@/stores/sidebar-store';

export function OpenSidebar() {
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

  if (showSidebarOpen) {
    return (
      <div
        className="absolute z-20 items-center justify-center hidden h-8 p-2 border top-2 left-2 rounded-md bg-neutral-950 border-white/10 hover:cursor-pointer md:flex"
        onClick={() => openSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    );
  }
}
