// Sidebar never loads open so do we even need a skeleton?

import { Icons } from '../icons';

export function SidebarSkeleton() {
  return (
    <div className="absolute z-10 flex items-center w-full h-10 text-gray-200 md:hidden">
      <div className="flex items-center flex-shrink-0">
        <button className="flex items-center justify-center w-10 h-10">
          <Icons.hamburger />
        </button>
        <div className="text-sm font-semibold">Bonfire</div>
      </div>
    </div>
  );
}
