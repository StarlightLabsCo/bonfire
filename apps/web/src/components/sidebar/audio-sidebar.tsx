'use client';

import { Slider } from '@/components/ui/slider';
import { Icons } from '../icons';
import { useAudioProcessor } from '../contexts/audio-context';

export function AudioSidebar() {
  const { setVolume } = useAudioProcessor();

  const onVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  return (
    <div className="h-10 w-full p-4 flex gap-x-4 items-center">
      <Icons.speakerMuted className="w-4 h-4 text-white/50" />
      <Slider
        defaultValue={[75]}
        max={100}
        step={1}
        onValueChange={onVolumeChange}
      />
      <Icons.speakerLoud className="w-4 h-4 text-white/50" />
    </div>
  );
}
