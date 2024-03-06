'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { StoryExampleCardDesktop } from './story-example-card-desktop';
import FadeIn from '@/components/animation/fadeIn';

type StoryExamplesProps = {
  className?: string;
};

const items = [
  {
    id: 'neon-wings',
    title: 'Neon Wings',
    description:
      'Aria Knight, a decorated pilot, uncovers conspiracies in a neon-drenched future where experimental aircraft technology leads to high-stakes espionage in the sprawling metropolis',
    image: 'https://r2.trybonfire.ai/clq23d5ja000ohd84z6elvb2z.png',
  },
  {
    id: 'the-harbors-secret',
    title: "The Harbor's Secret",
    description:
      'Eliza Harwood, a cunning navigator and scholar, searches for ancient artifacts in a world where the Age of Exploration thrives, all while navigating through political intrigue and the untamed oceans.',
    image: 'https://r2.trybonfire.ai/clq2fgzc0004yws205qlc4yhm.png',
  },
  {
    id: 'galactic-frontiers',
    title: 'Galactic Frontiers',
    description:
      'Ed Baldwin, astronaut extraordinaire, discovers a breathtaking exoplanet, with life forms and landscapes defying the laws of physics, on the brink of a discovery that could change humanity forever.',
    image: 'https://r2.trybonfire.ai/clq23fb0n0017hd84o4mxtuqs.png',
  },
  {
    id: 'the-last-stand',
    title: 'The Last Stand',
    description:
      'Aria Knight, a decorated pilot, uncovers conspiracies in a neon-drenched future where experimental aircraft technology leads to high-stakes espionage in the sprawling metropolis',
    image: 'https://r2.trybonfire.ai/clq23d5ja000ohd84z6elvb2z.png',
  },
];

export function StoryExamplesDesktop({ className }: StoryExamplesProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const itemCount = items.length;

  const selectItem = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className={cn('w-full relative h-[42rem] flex justify-center items-center', className)}>
      {items.map((item, index) => {
        const isCenter = index === selectedIndex;
        const offset = (index - selectedIndex + itemCount) % itemCount;
        const isLeft = offset === itemCount - 1;
        const isRight = offset === 1;
        let transform = '';
        let zIndex = 0;
        let delay = isCenter ? 1.5 : 2;

        if (isCenter) {
          transform = 'translateX(0%) translateZ(0) scale(1)';
          zIndex = 2;
        } else if (isLeft || isRight) {
          transform = isLeft ? 'translateX(-50%) translateZ(-100px) scale(0.8)' : 'translateX(50%) translateZ(-100px) scale(0.8)';
          zIndex = 1;
        } else {
          transform = 'translateX(0%) translateZ(-200px) scale(0.8)';
          zIndex = 0;
        }

        return (
          <div
            key={item.id}
            className={'absolute transition-all duration-500 ease-in-out transform-gpu'}
            style={{
              transform: transform,
              zIndex: zIndex,
            }}
            onClick={() => selectItem(index)}
          >
            <FadeIn delay={delay} x={isLeft ? 100 : isRight ? -100 : 0}>
              <StoryExampleCardDesktop
                id={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
                isActive={isCenter}
              />
            </FadeIn>
          </div>
        );
      })}
    </div>
  );
}
