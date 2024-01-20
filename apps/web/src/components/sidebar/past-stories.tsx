'use client';

import { usePathname } from 'next/navigation';
import { Instance } from '@prisma/client';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialog-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { Icons } from '@/components/icons';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export function PastStories({ instances, className }: { instances: Instance[]; className?: string }) {
  const pathname = usePathname();

  const closeSidebar = useSidebarStore((state) => state.closeSidebar);
  const setIsShareDialogOpen = useDialogStore((state) => state.setIsShareDialogOpen);
  const setIsInstanceInfoDialog = useDialogStore((state) => state.setIsInstanceInfoDialogOpen);
  const setIsDeleteInstanceDialogOpen = useDialogStore((state) => state.setIsDeleteInstanceDialogOpen);

  const handleClick = (path: string) => {
    if (path === pathname) return;

    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <div
      className={cn('w-full grow px-2 flex flex-col', className, {
        'overflow-y-hidden hover:overflow-y-scroll': window.innerWidth >= 768,
        'overflow-y-scroll': window.innerWidth < 768,
      })}
    >
      <div className="text-xs p-2">Past Stories</div>
      <div className="flex flex-col gap-y-2">
        {instances.map((instance, index) => {
          const isActive = pathname === `/instances/${instance.id}`;
          return (
            <Link
              key={index}
              href={`/instances/${instance.id}`}
              className={`group h-10 w-full p-2 flex items-center ${
                isActive ? 'bg-white/10' : 'hover:bg-white/10'
              } rounded-md text-xs font-light hover:cursor-pointer`}
              onClick={() => handleClick(`/instances/${instance.id}`)}
            >
              <Icons.logo className="w-4 h-4 mr-2 flex-shrink-0 z-10" />
              <div className="overflow-hidden w-full whitespace-nowrap relative">
                <div>{instance.name}</div>
                {isActive ? (
                  <>
                    <div className={`absolute inset-y-0 right-6 w-16 z-10 bg-gradient-to-l from-[#1A1A1A]`} />
                    <div className="absolute pl-2 inset-y-0 right-0 z-20 bg-[#1A1A1A]">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Icons.moreHorizontal className="w-4 h-4 text-white/50 hover:text-white" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40">
                          <DropdownMenuItem
                            className="text-xs font-light cursor-pointer focus:bg-neutral-800 p-2"
                            onSelect={() => setIsShareDialogOpen(true)}
                          >
                            <Icons.share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs font-light cursor-pointer focus:bg-neutral-800 p-2 my-2"
                            onSelect={() => setIsInstanceInfoDialog(true)}
                          >
                            <Icons.infoCircle className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs font-light cursor-pointer focus:bg-neutral-800 text-red-500 p-2"
                            onSelect={() => setIsDeleteInstanceDialogOpen(true)}
                          >
                            <Icons.trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                ) : (
                  <div className={`absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-black group-hover:from-[#1A1A1A]`} />
                )}
              </div>
            </Link>
          );
        })}
        <div className="h-6 w-full" />
      </div>
    </div>
  );
}
