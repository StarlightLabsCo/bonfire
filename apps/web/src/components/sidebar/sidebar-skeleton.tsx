// Sidebar never loads open so do we even need a skeleton?

import { Icons } from '../icons';

export function SidebarSkeleton() {
  return (
    <div className="absolute h-10 z-10 w-full flex items-center text-gray-200 md:hidden">
      <div className="flex items-center flex-shrink-0">
        <button className="h-10 w-10 flex items-center justify-center">
          <Icons.hamburger />
        </button>
        <div className="font-semibold text-sm">Bonfire</div>
      </div>
    </div>
  );
}
