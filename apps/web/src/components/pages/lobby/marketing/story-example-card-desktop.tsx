import TriggeredFadeIn from '@/components/animation/triggeredFadeIn';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

type StoryExampleCardProps = {
  isActive: boolean;
  id: string;
  title: string;
  description: string;
  image: string;
  className?: string;
};

export function StoryExampleCardDesktop({ id, isActive, title, description, image, className }: StoryExampleCardProps) {
  const truncatedDescription = description.split(' ').slice(0, 20).join(' ') + (description.split(' ').length > 20 ? '...' : '');

  return (
    <div className={cn('w-96 h-[42rem] rounded-xl relative border border-white drop-shadow-2xl', className)}>
      <div
        className={cn('absolute z-10 w-full h-full bg-black/90 transition-opacity duration-500 ease-in-out rounded-xl')}
        style={{ opacity: isActive ? 0 : 0.8 }}
      />
      <Image className="object-cover h-full rounded-[11px] aspect-9/16" src={image} alt={title} width={1792} height={1024} />
      <div className="absolute bottom-0 w-full h-1/4 bg-black/90 rounded-b-xl" />
      <div className="absolute w-full bottom-1/4 h-1/4 bg-gradient-to-t from-black/90 to-transparent" />
      <div className="absolute bottom-0 z-10 flex flex-col justify-between w-full h-48 p-3 mb-3 gap-y-1">
        <TriggeredFadeIn animated={isActive}>
          <div className="text-3xl font-black text-center drop-shadow-lg">{title}</div>
        </TriggeredFadeIn>
        <TriggeredFadeIn animated={isActive}>
          <div className="text-sm font-light text-center text-neutral-400">{truncatedDescription}</div>
        </TriggeredFadeIn>

        <TriggeredFadeIn animated={isActive}>
          <Link
            href={`/examples/${id}`}
            className="relative h-9 w-24 mx-auto flex items-center justify-center bg-[#ff8f00] rounded-full z-20 text-white hover:scale-105 cursor-pointer"
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
