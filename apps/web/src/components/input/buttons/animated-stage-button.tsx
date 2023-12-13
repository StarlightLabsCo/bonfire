import React, { useEffect, useState } from 'react';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { InstanceStage } from 'database';
import { Button } from './button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const StageIcons = {
  [InstanceStage.INTRODUCE_STORY_START]: <Icons.magicWand />,
  [InstanceStage.CONTINUE_STORY_START]: <Icons.magicWand />,
  [InstanceStage.CREATE_IMAGE_START]: <Icons.image />,
  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: <Icons.lightning />,
};

const StageProgress = {
  [InstanceStage.INTRODUCE_STORY_START]: 0,
  [InstanceStage.CONTINUE_STORY_START]: 0,
  [InstanceStage.CREATE_IMAGE_START]: 0.5,
  [InstanceStage.GENERATE_ACTION_SUGGESTIONS_START]: 0.75,
};

type AnimatedStageButtonProps = {
  className?: string;
};

export function AnimatedStageButton({ className }: AnimatedStageButtonProps) {
  const stage = useCurrentInstanceStore((state) => state.stage);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stageProgress = StageProgress[stage as keyof typeof StageProgress];
    if (stageProgress == null) return;

    setProgress(stageProgress);
  }, [stage]);

  const icon = stage ? StageIcons[InstanceStage[stage] as keyof typeof StageIcons] : null;

  return <Button icon={icon ? icon : <Icons.magicWand />} disabled className={cn('hover:text-white/50', className)} />;
}
