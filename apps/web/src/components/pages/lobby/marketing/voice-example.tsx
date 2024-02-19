'use client';

import { Combobox } from '@/components/ui/combobox';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import WaveSurfer from 'wavesurfer.js';
import { voices } from '@/lib/audio/voices';
import { motion } from 'framer-motion';

type VoiceExampleProps = {
  className?: string;
};

export function VoiceExample({ className }: VoiceExampleProps) {
  const [selectedVoice, setSelectedVoice] = useState(voices[0].value);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const wavesurferRef = useRef<WaveSurfer | null>(null); // Create a ref to store the wavesurfer instance
  const [isPlaying, setIsPlaying] = useState(false); // New state to track playing status

  useEffect(() => {
    // Initialize WaveSurfer and store it in the ref
    wavesurferRef.current = WaveSurfer.create({
      container: '#waveform',
      url: `/voices/${voices.find((voice) => voice.value === selectedVoice)?.label}/${Math.floor(Math.random() * 3)}.mp3`,

      height: 'auto',

      waveColor: '#646464',
      progressColor: '#ff8f00',
      barWidth: 3,
      barGap: 3,
      barRadius: 10,

      cursorWidth: 0,
    });

    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));
    wavesurferRef.current.on('finish', () => {
      wavesurferRef.current?.seekTo(0);
      setIsPlaying(false); // Update playing status when audio finishes
    });

    return () => {
      wavesurferRef.current?.destroy();
      setIsPlaying(false);
    };
  }, [selectedVoice]);

  const handlePlayPauseClick = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className={cn('flex flex-col gap-y-4', className)}>
      <Combobox
        items={voices}
        placeholder="Select a voice"
        noItemFoundMessage="No voices found"
        value={selectedVoice}
        onChange={(value) => setSelectedVoice(value)}
        open={isComboboxOpen}
        onOpenChange={(isOpen) => setIsComboboxOpen(isOpen)}
      />
      <div className="flex w-full gap-x-2 h-16 items-center">
        {isPlaying ? (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 0.3 }}>
            <Icons.pause className="w-10 h-10" onClick={handlePlayPauseClick} />
          </motion.div>
        ) : (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 0.3 }}>
            <Icons.play className="w-10 h-10" onClick={handlePlayPauseClick} />
          </motion.div>
        )}
        <div className="flex items-center w-full h-full rounded-lg p-2">
          <div id="waveform" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
