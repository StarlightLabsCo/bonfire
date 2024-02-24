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

export function StoryExampleCardMobile({ isActive, title, description, image, className }: StoryExampleCardProps) {
  const truncatedDescription = description.split(' ').slice(0, 12).join(' ') + (description.split(' ').length > 12 ? '...' : '');

  return (
    <div className={cn('h-full rounded-xl relative border border-white', className)}>
      <Image className="object-cover h-full rounded-xl aspect-9/16" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute w-full bottom-1/4 h-1/4 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute bottom-0 z-10 flex flex-col justify-between w-full p-3 mb-3 h-2/5 gap-y-1">
        <TriggeredFadeIn animated={isActive}>
          <div className="text-3xl font-black text-center drop-shadow-lg">{title}</div>
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
