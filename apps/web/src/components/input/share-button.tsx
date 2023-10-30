import { cn } from '@/lib/utils';
import { Icons } from '../icons';

interface ShareButtonProps {
  className?: string;
  onClick?: () => void;
}

export function ShareButton({ className, onClick }: ShareButtonProps) {
  return (
    <button
      className={cn(
        'flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 border rounded-full border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 fade-in-2s',
        className,
      )}
      onClick={onClick}
    >
      <Icons.share />
    </button>
  );
}
