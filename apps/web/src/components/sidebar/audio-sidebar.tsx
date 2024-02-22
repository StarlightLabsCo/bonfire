'use client';

import { Slider } from '@/components/ui/slider';
import { Icons } from '../icons';
import { usePlaybackStore } from '@/stores/audio/playback-store';

export function AudioSidebar() {
  const volume = usePlaybackStore((state) => state.volume);
  const setVolume = usePlaybackStore((state) => state.setVolume);

  const onVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const value = volume != null ? [volume * 100] : [100];

  return (
    <div className="relative w-full h-10">
      <div className="absolute top-[calc(-2.8rem)] z-20 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent" />
      <div className="relative flex items-center w-full h-full p-4 gap-x-4">
        <Icons.speakerMuted
          className="w-4 h-4 text-white/50 hover:cursor-pointer"
          onClick={() => onVolumeChange([0])}
        />
        <Slider value={value} max={100} step={1} onValueChange={onVolumeChange} />
        <Icons.speakerLoud
          className="w-4 h-4 text-white/50 hover:cursor-pointer"
          onClick={() => onVolumeChange([100])}
        />
      </div>
    </div>
  );
}
