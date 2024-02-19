import TriggeredFadeIn from '@/components/animation/triggeredFadeIn';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type StoryExampleCardProps = {
  isActive: boolean;
  title: string;
  description: string;
  image: string;
  className?: string;
};

export function StoryExampleCard({ isActive, title, description, image, className }: StoryExampleCardProps) {
  const truncatedDescription = description.split(' ').slice(0, 12).join(' ') + (description.split(' ').length > 12 ? '...' : '');

  return (
    <div className={cn('h-full rounded-xl relative border border-white', className)}>
      <Image className="rounded-xl object-cover h-full aspect-9/16" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute bottom-1/4 w-full h-1/4 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute bottom-0 h-2/5 z-10 flex flex-col p-3 gap-y-1 justify-between mb-3">
        <TriggeredFadeIn animated={isActive}>
          <div className="font-black text-3xl drop-shadow-lg text-center">{title}</div>
        </TriggeredFadeIn>
        <TriggeredFadeIn animated={isActive} delay={0.1}>
          <div className="text-xs font-light text-center text-neutral-400">{truncatedDescription}</div>
        </TriggeredFadeIn>

        <TriggeredFadeIn animated={isActive} delay={0.2}>
          <Link
            href="/login"
            className="relative h-9 w-24 mx-auto flex items-center justify-center bg-[#ff8f00] rounded-full z-10 text-white"
          >
            <div className="flex items-center gap-x-1">
              <div className="font-bold">Play</div>
            </div>
          </Link>
        </TriggeredFadeIn>
      </div>
    </div>
  );
}
