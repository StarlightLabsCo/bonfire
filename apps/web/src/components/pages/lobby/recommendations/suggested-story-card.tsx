import TriggeredFadeIn from '@/components/animation/triggeredFadeIn';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type SuggestedStoryCard = {
  isActive: boolean;
  title: string;
  description: string;
  image: string;
  className?: string;
};

export function SuggestedStoryCard({ isActive, title, description, image, className }: SuggestedStoryCard) {
  return (
    <div className={cn('h-full rounded-xl relative border border-white flex flex-col grow', className)}>
      <Image className="rounded-xl object-cover h-full" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute bottom-1/4 w-full h-1/4 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute bottom-0 w-full p-5 flex flex-col items-center gap-y-2">
        <TriggeredFadeIn animated={isActive}>
          <div className="font-black text-3xl drop-shadow-lg text-left">{title}</div>
        </TriggeredFadeIn>
        <TriggeredFadeIn animated={isActive}>
          <div className="text-neutral-400 font-light text-xs text-left">{description}</div>
        </TriggeredFadeIn>
      </div>
    </div>
  );
}
