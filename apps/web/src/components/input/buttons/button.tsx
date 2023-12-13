import { cn } from '@/lib/utils';

type ButtonProps = {
  onClick?: () => void;
  icon: React.ReactNode;
  className?: string;
};

export function Button({ onClick, icon, className, ...props }: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'flex flex-row items-center gap-x-2 text-sm px-3 py-1 w-10 h-10 rounded-full border-[0.5px] border-white/20 hover:border-white/30 bg-neutral-950 text-white/50 hover:text-white/80',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  );
}
