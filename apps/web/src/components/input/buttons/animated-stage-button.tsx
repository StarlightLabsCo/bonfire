import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type AnimatedStageButtonProps = {
  progress: number;
  icon: React.ReactNode;
  className?: string;
};

export function AnimatedStageButton({ progress, icon, className }: AnimatedStageButtonProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const strokeWidth = 2;
  const radius = 20 - strokeWidth / 2 - 0.5; // Adjust the radius here
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - currentProgress * circumference;

  useEffect(() => {
    const animateProgress = (startValue: number, endValue: number, duration: number) => {
      const start = performance.now();
      requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        const currentProgress = startValue + (endValue - startValue) * timeFraction;
        setCurrentProgress(currentProgress);

        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }
      });
    };

    animateProgress(currentProgress, progress, 500); // 500ms transition duration
  }, [progress]);

  return (
    <div className={cn('relative', className)}>
      <Button icon={icon} disabled className={cn('hover:text-white/50')} />
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 40 40">
        <circle
          stroke="#CCCCCC"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx="20"
          cy="20"
          transform="rotate(-90 20 20)"
        />
      </svg>
    </div>
  );
}
