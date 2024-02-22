import TriggeredFadeIn from '@/components/animation/triggeredFadeIn';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ArtStyleCard = {
  isActive: boolean;
  title: string;
  image: string;
  className?: string;
};

export function ArtStyleCard({ isActive, title, image, className }: ArtStyleCard) {
  return (
    <div className={cn('h-full rounded-xl relative border border-white flex flex-col grow', className)}>
      <Image className="object-cover h-full rounded-xl" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute w-full bottom-1/4 h-1/4 bg-gradient-to-t from-black/90 to-transparent" />

      <div className="absolute bottom-0 flex flex-col items-center w-full p-5 gap-y-2">
        <TriggeredFadeIn animated={isActive}>
          <div className="text-3xl font-black text-left drop-shadow-lg">{title}</div>
        </TriggeredFadeIn>
      </div>
    </div>
  );
}
