import { Icons } from '@/components/icons';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { SuggestedStoryCard } from './suggested-story-card';

type CustomStoryEditorProps = {
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

export default function CustomStoryEditor({ className }: CustomStoryEditorProps) {
  return (
    <div className={cn('flex flex-col gap-y-6 w-full', className)}>
      <div className="w-full flex flex-col gap-y-2 px-4">
        <div className="flex justify-between items-center mt-5">
          <div className="font-bold">Story Outline</div>
          <div className="px-3 py-1 flex gap-x-1 items-center justify-center border border-white/10 rounded-lg text-xs font-light">
            Complete
            <Icons.sparkles className="h-3 w-3" />
          </div>
        </div>
        <div className="h-40 w-full border border-white/10 rounded-lg p-2">
          <div className="font-light text-xs text-neutral-600">Text goes here...</div>
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-2">
        <div className="flex items-center font-bold px-4">Art Style</div>

        <Carousel className={cn(className)}>
          <CarouselContent className="w-full h-full">
            {stories.map((story, index) => (
              <CarouselItem
                key={index}
                index={index}
                renderItem={(isActive: boolean) => (
                  <SuggestedStoryCard
                    title={story.title}
                    image={story.image}
                    description={story.description}
                    isActive={isActive} // Pass isActive to StoryExampleCard
                  />
                )}
              />
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="w-full flex flex-col gap-y-2 px-4">
        <div className="flex items-center font-bold">Narrator</div>
      </div>
    </div>
  );
}
