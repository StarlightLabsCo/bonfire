'use client';

import { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Icons } from '@/components/icons';
import { voices } from '@/lib/audio/voices';
import { Combobox } from '@/components/ui/combobox';

type NarratorVoiceSelectorProps = {
  isComboboxOpen: boolean;
  setIsComboboxOpen: (value: boolean) => void;

  selectedVoice: string;
  setSelectedVoice: (value: string) => void;

  className?: string;
};

export default function NarratorVoiceSelector({
  isComboboxOpen,
  setIsComboboxOpen,
  selectedVoice,
  setSelectedVoice,
  className,
}: NarratorVoiceSelectorProps) {
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    wavesurferRef.current = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#646464',
      progressColor: '#ff8f00',
      barWidth: 3,
      barGap: 3,
      barRadius: 10,
      cursorWidth: 0,
      height: 'auto',
    });

    wavesurferRef.current.load(
      `/voices/${voices.find((voice) => voice.value === selectedVoice)?.label}/${Math.floor(Math.random() * 3)}.mp3`,
    );

    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));
    wavesurferRef.current.on('finish', () => {
      wavesurferRef.current?.seekTo(0);
      setIsPlaying(false);
    });

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [selectedVoice]);

  const handlePlayPauseClick = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-2 px-4 border-b border-white/10 pb-10">
      <div className="flex items-center font-bold">Narrator Voice</div>
      <Combobox
        items={voices}
        placeholder="Select a voice"
        noItemFoundMessage="No voices found"
        value={selectedVoice}
        onChange={(value) => setSelectedVoice(value)}
        open={isComboboxOpen}
        onOpenChange={(isOpen) => setIsComboboxOpen(isOpen)}
      />
      <div className="w-full flex gap-x-2 h-16 items-center shrink-0">
        {isPlaying ? (
          <Icons.pause className="w-10 h-10" onClick={handlePlayPauseClick} />
        ) : (
          <Icons.play className="w-10 h-10" onClick={handlePlayPauseClick} />
        )}
        <div id="waveform" className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
