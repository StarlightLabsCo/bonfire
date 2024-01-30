import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CallToAction({ className }: { className?: string }) {
  return (
    <div className={cn('w-full grow px-2 flex flex-col items-center justify-center gap-y-2', className)}>
      <div className="flex flex-col gap-y-3 md:text-sm">Want to make your own story?</div>
      <Link href="/login">
        <button
          className={cn(
            'px-3 py-1 rounded-full border border-white/20  text-white/70 whitespace-nowrap hover:border-white/30 hover:text-white/90',
            className,
          )}
        >
          <span className="text-sm font-light">Sign Up</span>
        </button>
      </Link>
    </div>
  );
}
