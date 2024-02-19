'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useLobbyStore } from '@/stores/lobby-store';

import StoryOutlineInput from './story-outline-input';
import ArtStyleCarousel from './art-style-carousel';
import NarratorVoiceSelector from './narrator-voice-selector';
import NarratorPersonaInput from './narrator-persona-input';
import NarratorResponseLengthSlider from './narrator-response-length-slider';

type CustomStoryEditorProps = {
  className?: string;
};

export default function CustomStoryEditor({ className }: CustomStoryEditorProps) {
  const storyOutline = useLobbyStore((state) => state.storyOutline);
  const setStoryOutline = useLobbyStore((state) => state.setStoryOutline);

  const imageStyle = useLobbyStore((state) => state.imageStyle);
  const setImageStyle = useLobbyStore((state) => state.setImageStyle);

  const narratorVoiceId = useLobbyStore((state) => state.narratorVoiceId);
  const setNarratorVoiceId = useLobbyStore((state) => state.setNarratorVoiceId);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const narratorPrompt = useLobbyStore((state) => state.narratorPrompt);
  const setNarratorPrompt = useLobbyStore((state) => state.setNarratorPrompt);

  const narratorResponseLength = useLobbyStore((state) => state.narratorResponseLength);
  const setNarratorResponseLength = useLobbyStore((state) => state.setNarratorResponseLength);

  return (
    <div className={cn('flex flex-col gap-y-8 w-full', className)}>
      <StoryOutlineInput storyOutline={storyOutline} setStoryOutline={setStoryOutline} />
      <ArtStyleCarousel setSelectedArtStyle={setImageStyle} />
      <NarratorVoiceSelector
        isComboboxOpen={isComboboxOpen}
        setIsComboboxOpen={setIsComboboxOpen}
        selectedVoice={narratorVoiceId}
        setSelectedVoice={setNarratorVoiceId}
      />
      <NarratorPersonaInput narratorPrompt={narratorPrompt} setNarratorPrompt={setNarratorPrompt} />
      <NarratorResponseLengthSlider narratorResponseLength={narratorResponseLength} setNarratorResponseLength={setNarratorResponseLength} />
    </div>
  );
}
