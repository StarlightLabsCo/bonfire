'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import { useSidebarStore } from '@/stores/sidebar-store';

export function TopActions() {
  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const router = useRouter();

  const handleClick = (path: string) => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
    router.push(path);
  };

  return (
    <div className="w-full h-12 p-2 flex items-center gap-x-2">
      <div
        className="h-8 flex grow p-2 gap-x-2 items-center rounded-md border border-white/10 hover:cursor-pointer"
        onClick={() => handleClick('/')}
      >
        <Icons.plus className="w-4 h-4" />
        <div className="text-xs font-light">New Story</div>
      </div>
      <div
        className="h-8 flex p-2 items-center justify-center rounded-md border border-white/10 hover:cursor-pointer"
        onClick={() => closeSidebar()}
      >
        <Icons.sidepanel className="w-4 h-4" />
      </div>
    </div>
  );
}
