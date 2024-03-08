'use client';

import { Icons } from '../icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';

export function TopActions() {
  const pathname = usePathname();

  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);
  const setMessages = useMessagesStore((state) => state.setMessages);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const handleClick = () => {
    if (window.innerWidth < 768 || pathname.startsWith('/examples')) {
      closeSidebar();
    }

    setInstanceId(null);
    setMessages([]);
    clearAudio();
  };

  return (
    <div className="flex items-center w-full h-12 p-2 gap-x-2">
      <Link
        href="/"
        onClick={handleClick}
        className="flex items-center h-8 p-2 border grow gap-x-2 rounded-md border-white/10 hover:cursor-pointer"
      >
        {pathname.startsWith('/examples') ? (
          <>
            <Icons.chevronLeft className="w-4 h-4" />
            <div className="text-xs font-light">Landing Page</div>
          </>
        ) : (
          <>
            <Icons.plus className="w-4 h-4" />
            <div className="text-xs font-light">New Story</div>
          </>
        )}
      </Link>
      <div
        className="flex items-center justify-center h-8 p-2 border rounded-md border-white/10 hover:cursor-pointer"
        onClick={() => closeSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    </div>
  );
}
