'use client';

import { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { FeaturedStoryTemplateCard } from '@/components/featured-story-template-card';
import { cn } from '@/lib/utils';

type FeaturedStoryTemplatesProps = {
  featuredStoryTemplates: any[]; // TODO: Replace with InstanceTemplate or better type when available,
  className?: string;
};

export function FeaturedStoryTemplates({ featuredStoryTemplates, className }: FeaturedStoryTemplatesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const renderDots = () => {
    return Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className={`h-1 w-1 ${
          current === index ? 'bg-white' : 'bg-white/10'
        } rounded-full inline-block mx-1 transition-colors duration-300 cursor-pointer hover:bg-white/20`}
        onClick={() => {
          api?.scrollTo(index);
          api?.plugins().autoplay.stop();
        }}
      />
    ));
  };

  return (
    <Carousel
      setApi={setApi}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className={cn('w-3/4', className)}
    >
      <CarouselContent>
        {featuredStoryTemplates.map((featuredStoryTemplate, index) => (
          <CarouselItem key={featuredStoryTemplate.id}>
            <FeaturedStoryTemplateCard isActive={current === index} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <div className="flex justify-center mt-4">{renderDots()}</div>
    </Carousel>
  );
}
