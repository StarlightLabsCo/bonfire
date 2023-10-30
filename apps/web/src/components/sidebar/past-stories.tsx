import { Instance } from '@prisma/client';
import { Icons } from '../icons';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '../contexts/sidebar-context';

export function PastStories({
  instances,
  className,
}: {
  instances: Instance[];
  className?: string;
}) {
  const router = useRouter();
  const { closeSidebar } = useSidebar();

  const handleClick = (path: string) => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
    router.push(path);
  };

  return (
    <div
      className={cn(
        'w-full grow px-2 flex flex-col overflow-y-scroll',
        className,
      )}
    >
      <div className="text-xs p-2">Past Stories</div>
      <div className="flex flex-col gap-y-2">
        {instances.map((instance, index) => (
          <div
            key={index}
            className="group h-10 w-full p-2 flex items-center hover:bg-white/10 rounded-md text-xs font-light hover:cursor-pointer"
            onClick={() => handleClick(`/instances/${instance.id}`)}
          >
            <Icons.logo className="w-4 h-4 mr-2 flex-shrink-0" />
            <div className="overflow-hidden w-full whitespace-nowrap relative">
              <div>{instance.description}</div>
              <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-black group-hover:hidden" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
