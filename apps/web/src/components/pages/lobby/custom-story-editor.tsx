'use client';

import { Icons } from '@/components/icons';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Combobox } from '@/components/ui/combobox'; // Import Combobox
import { useEffect, useState, useRef } from 'react'; // Import useState, useEffect, useRef
import WaveSurfer from 'wavesurfer.js'; // Import WaveSurfer
import { cn } from '@/lib/utils';
import { ArtStyleCard } from './art-style-card';
import { voices } from '@/lib/audio/voices'; // Assuming you have a similar voices array as in voice-example.tsx
import { Switch } from '@/components/ui/switch';

type CustomStoryEditorProps = {
  className?: string;
};

const styles = [
  {
    title: 'Oil Painting',
    image: 'https://r2.trybonfire.ai/oil.webp',
  },
  {
    title: 'Digital Painting',
    image: 'https://r2.trybonfire.ai/digital.webp',
  },
  {
    title: 'Illustration',
    image: 'https://r2.trybonfire.ai/illustration.png',
  },
  {
    title: 'Realistic',
    image: 'https://r2.trybonfire.ai/realistic.png',
  },
  {
    title: 'Cartoon',
    image: 'https://r2.trybonfire.ai/cartoon.webp',
  },
  {
    title: '3D Render',
    image: 'https://r2.trybonfire.ai/3drender.webp',
  },
  {
    title: 'Watercolor',
    image: 'https://r2.trybonfire.ai/watercolor.webp',
  },
  {
    title: 'Neon',
    image: 'https://r2.trybonfire.ai/neon.webp',
  },
  {
    title: 'Vaporwave',
    image: 'https://r2.trybonfire.ai/vaporwave.webp',
  },
  {
    title: 'Comic Book',
    image: 'https://r2.trybonfire.ai/comic.webp',
  },
  {
    title: 'Minecraft',
    image: 'https://r2.trybonfire.ai/minecraft.webp',
  },
  {
    title: 'Anime',
    image: 'https://r2.trybonfire.ai/anime.webp',
  },
  {
    title: 'Manga',
    image: 'https://r2.trybonfire.ai/manga.webp',
  },
  {
    title: 'Chibi',
    image: 'https://r2.trybonfire.ai/chibi.webp',
  },
  {
    title: 'Greek Painting',
    image: 'https://r2.trybonfire.ai/greek.webp',
  },
  {
    title: 'Chinese Painting',
    image: 'https://r2.trybonfire.ai/chinese.webp',
  },
  {
    title: 'Aztec Mural',
    image: 'https://r2.trybonfire.ai/aztec.webp',
  },
  {
    title: 'Pixel Art',
    image: 'https://r2.trybonfire.ai/pixel.webp',
  },
  {
    title: 'Charcoal',
    image: 'https://r2.trybonfire.ai/charcoal.webp',
  },
  {
    title: 'Lovecraftian',
    image: 'https://r2.trybonfire.ai/lovecraftian.webp',
  },
  {
    title: 'Surrealism',
    image: 'https://r2.trybonfire.ai/surrealism.webp',
  },
  {
    title: 'Art Deco',
    image: 'https://r2.trybonfire.ai/artdeco.webp',
  },
  {
    title: 'Art Nouveau',
    image: 'https://r2.trybonfire.ai/artnouveau.webp',
  },
];

export default function CustomStoryEditor({ className }: CustomStoryEditorProps) {
  const [selectedVoice, setSelectedVoice] = useState(voices[0].value);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [defaultNarratorPromptEnabled, setDefaultNarratorPromptEnabled] = useState(true);

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
            {styles.map((style, index) => (
              <CarouselItem
                key={index}
                index={index}
                renderItem={(isActive: boolean) => <ArtStyleCard title={style.title} image={style.image} isActive={isActive} />}
              />
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="w-full flex flex-col gap-y-2 px-4">
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
      <div className="w-full flex flex-col gap-y-2 px-4 mb-10">
        <div className="flex items-center font-bold">Narrator Persona</div>
        <div className="w-full flex items-center gap-x-1">
          <div>Default</div>
          <Switch checked={defaultNarratorPromptEnabled} onCheckedChange={setDefaultNarratorPromptEnabled} />
          <div>Custom</div>
        </div>
      </div>
    </div>
  );
}
