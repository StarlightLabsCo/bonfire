import { cn } from '@/lib/utils';
import Image from 'next/image';
import { LobbyInput } from './input/lobby-input';

type HeroProps = {
  className?: string;
};

export function Hero({ className }: HeroProps) {
  return (
    <div className={cn('w-full h-[75vh] flex flex-col items-center justify-center relative', className)}>
      <div className="w-full h-full absolute top-0 left-0 z-0">
        <Image src="https://r2.trybonfire.ai/clr0muo2i004zaql2ufpgvqs3.png" layout="fill" objectFit="cover" alt="Hero image" />
      </div>
      {/* Gradient overlay */}
      <div className="w-full h-1/2 absolute bottom-0 left-0 z-10 from-neutral-950 to-transparent bg-gradient-to-t" />
      <LobbyInput submitted={false} setSubmitted={undefined} className="w-full z-20" />
    </div>
  );
}
