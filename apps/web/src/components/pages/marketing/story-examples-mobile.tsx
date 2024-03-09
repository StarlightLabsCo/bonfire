'use client';

import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { StoryExampleCardMobile } from './story-example-card-mobile';

type StoryExamplesProps = {
  className?: string;
};

const stories = [
  {
    title: 'Neon Wings',
    description:
      'Aria Knight, a decorated pilot, uncovers conspiracies in a neon-drenched future where experimental aircraft technology leads to high-stakes espionage in the sprawling metropolis',
    image: 'https://r2.trybonfire.ai/clq23d5ja000ohd84z6elvb2z.png',
  },
  {
    title: "The Harbor's Secret",
    description:
      'Eliza Harwood, a cunning navigator and scholar, searches for ancient artifacts in a world where the Age of Exploration thrives, all while navigating through political intrigue and the untamed oceans.',
    image: 'https://r2.trybonfire.ai/clq2fgzc0004yws205qlc4yhm.png',
  },
  {
    title: 'Galactic Frontiers',
    description:
      'Ed Baldwin, astronaut extraordinaire, discovers a breathtaking exoplanet, with life forms and landscapes defying the laws of physics, on the brink of a discovery that could change humanity forever.',
    image: 'https://r2.trybonfire.ai/clq23fb0n0017hd84o4mxtuqs.png',
  },
];

export function StoryExamplesMobile({ className }: StoryExamplesProps) {
  return (
    <div className={cn('w-full relative', className)}>
      <div className="absolute top-0 left-0 z-10 hidden w-1/4 h-full pointer-events-none md:block bg-gradient-to-r from-black to-transparent" />
      <div className="absolute top-0 right-0 z-10 hidden w-1/4 h-full pointer-events-none md:block bg-gradient-to-l from-black to-transparent" />
      <Carousel>
        <CarouselContent className="w-full md:max-h-96">
          {stories.map((story, index) => (
            <CarouselItem
              key={index}
              index={index}
              className={'flex justify-center'}
              renderItem={(isActive: boolean) => (
                <StoryExampleCardMobile title={story.title} description={story.description} image={story.image} isActive={isActive} />
              )}
            />
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
