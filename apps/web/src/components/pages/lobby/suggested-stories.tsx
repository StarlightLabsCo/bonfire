'use client';

import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { SuggestedStoryCard } from './suggested-story-card';

type SuggestedStoriesProps = {
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

export function SuggestedStories({ className }: SuggestedStoriesProps) {
  return (
    <Carousel className={cn(className)}>
      <CarouselContent className="w-full h-full">
        {stories.map((story, index) => (
          <CarouselItem
            key={index}
            index={index}
            className={'flex justify-center h-1/2'}
            renderItem={(isActive: boolean) => (
              <>
                <SuggestedStoryCard
                  title={story.title}
                  image={story.image}
                  isActive={isActive} // Pass isActive to StoryExampleCard
                />
                <div className="p-4 text-neutral-400 font-light text-xs">{story.description}</div>
              </>
            )}
          />
        ))}
      </CarouselContent>
    </Carousel>
  );
}
