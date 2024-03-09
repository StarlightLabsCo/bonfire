'use client';

import Bounce from '@/components/animation/bounce';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type ScrollArrowProps = {
  scrollTo?: string;
  className?: string;
};

export function ScrollArrow({ scrollTo, className }: ScrollArrowProps) {
  const handleClick = () => {
    console.log('scrollTo', scrollTo);
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Bounce className={cn('w-full flex justify-center', className)}>
      <Icons.doubleArrowDown onClick={handleClick} />
    </Bounce>
  );
}
