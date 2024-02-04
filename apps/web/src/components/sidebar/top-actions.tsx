'use client';

import { Icons } from '../icons';
import Link from 'next/link';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';

export function TopActions() {
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);

  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);
  const setMessages = useMessagesStore((state) => state.setMessages);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);

  const handleClick = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }

    setInstanceId(null);
    setMessages([]);
    clearAudio();
  };

  return (
    <div className="w-full h-12 p-2 flex items-center gap-x-2">
      <Link
        href="/"
        onClick={handleClick}
        className="h-8 flex grow p-2 gap-x-2 items-center rounded-md border border-white/10 hover:cursor-pointer"
      >
        <Icons.plus className="w-4 h-4" />
        <div className="text-xs font-light">New Story</div>
      </Link>
      <div
        className="h-8 flex p-2 items-center justify-center rounded-md border border-white/10 hover:cursor-pointer"
        onClick={() => closeSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    </div>
  );
}
