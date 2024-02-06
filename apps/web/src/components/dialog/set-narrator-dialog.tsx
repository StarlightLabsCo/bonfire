'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialogStore } from '@/stores/dialog-store';
import { Textarea } from '../ui/textarea';
import { useLobbyStore } from '@/stores/lobby-store';
import { useState } from 'react';
import { Combobox } from '../ui/combobox';
import { Slider } from '../ui/slider';
import { voices } from '@/lib/audio/voices';

export function SetNarratorDialog() {
  const isSetNarratorDialogOpen = useDialogStore((state) => state.isSetNarratorDialogOpen);
  const setIsSetNarratorDialogOpen = useDialogStore((state) => state.setIsSetNarratorDialogOpen);

  const narratorPrompt = useLobbyStore((state) => state.narratorPrompt);
  const setNarratorPrompt = useLobbyStore((state) => state.setNarratorPrompt);

  const narratorVoiceId = useLobbyStore((state) => state.narratorVoiceId);
  const setNarratorVoiceId = useLobbyStore((state) => state.setNarratorVoiceId);

  const narratorResponseLength = useLobbyStore((state) => state.narratorResponseLength);
  const setNarratorResponseLength = useLobbyStore((state) => state.setNarratorResponseLength);

  const placeholder =
    "You are a master storyteller in charge of a text-adventure game. Your goal is to create a thrilling, vibrant, and detailed story with deep multi-faceted characters, and clean followable structure that features the player (whom you talk about in the 2nd person) as the main character. The quality we're going for is feeling like the listener is in a book or film, and should match pacing accordingly. Expand on important sections, but keep the story progressing at all times. When it's appropriate you can imitate characters in the story for dialogue sections. Make sure to allow the player to make all the decisions, and do not condense the story. The player should feel like they are driving the story, and you are just the narrator. Favor bite-sized chunks of story that let the player make many small decisions rather than long monologues.";
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  return (
    <Dialog open={isSetNarratorDialogOpen} onOpenChange={setIsSetNarratorDialogOpen}>
      <DialogContent className=" max-w-3xl flex flex-col h-[100dvh] md:h-3/4">
        <DialogHeader>
          <DialogTitle>Narrator</DialogTitle>
          <DialogDescription>Define the behavior, personality and voice of your narrator.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col w-full h-full gap-y-5 mt-2">
          <div className="flex flex-col gap-y-1">
            <div>Prompt</div>
            <Textarea
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              value={narratorPrompt}
              placeholder={placeholder}
              onChange={(e) => setNarratorPrompt(e.target.value)}
              className="w-full h-60 border-white/10 bg-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <div>Voice</div>
            <Combobox
              items={voices}
              placeholder="Select a voice"
              noItemFoundMessage="No voices found"
              value={narratorVoiceId}
              onChange={(value) => setNarratorVoiceId(value)}
              open={isComboboxOpen}
              onOpenChange={(isOpen) => setIsComboboxOpen(isOpen)}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            Response Length
            <div className="h-full w-full flex gap-x-4 items-center relative">
              1
              <Slider
                min={1}
                max={12}
                step={1}
                value={[narratorResponseLength]}
                onValueChange={(value) => setNarratorResponseLength(value[0])}
              />
              12
            </div>
            <div className="text-xs text-white/50">
              The narrator will roughly respond with {narratorResponseLength} sentence{narratorResponseLength > 1 && 's'}.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
