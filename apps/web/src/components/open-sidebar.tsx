'use client';

import { useCallback, useEffect } from 'react';
import { useSidebar } from './contexts/sidebar-context';
import { Icons } from './icons';

export function OpenSidebar() {
  const { showSidebarOpen, openSidebar, closeSidebar } = useSidebar();

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
        className="absolute top-2 left-2 h-8 p-2 items-center justify-center rounded-md border border-white/10 hover:cursor-pointer hidden md:flex"
        onClick={() => openSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    );
  }
}
