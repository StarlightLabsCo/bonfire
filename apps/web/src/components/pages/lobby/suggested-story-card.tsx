import TriggeredFadeIn from '@/components/animation/triggeredFadeIn';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type SuggestedStoryCard = {
  isActive: boolean;
  title: string;
  image: string;
  className?: string;
};

export function SuggestedStoryCard({ isActive, title, image, className }: SuggestedStoryCard) {
  return (
    <div className={cn('rounded-xl relative border border-white', className)}>
      <Image className="rounded-xl object-cover h-full aspect-1" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute bottom-1/4 w-full h-1/4 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute bottom-0 w-full p-3 flex flex-col items-center">
        <TriggeredFadeIn animated={isActive}>
          <div className="font-black text-3xl drop-shadow-lg text-center">{title}</div>
        </TriggeredFadeIn>
      </div>
    </div>
  );
}
