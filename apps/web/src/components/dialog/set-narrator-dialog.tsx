'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialogStore } from '@/stores/dialog-store';
import { Textarea } from '../ui/textarea';
import { useLobbyStore } from '@/stores/lobby-store';
import { useState } from 'react';
import { Combobox } from '../ui/combobox';

export const voices = [
  {
    value: '1Tbay5PQasIwgSzUscmj',
    label: 'Knightley',
    subLabel: 'Old British Male - Default',
  },
  {
    value: '3UVpV0SlKmqXRe4yWHGG',
    label: 'Alex',
    subLabel: 'Young American Male',
  },
  {
    value: 'rU18Fk3uSDhmg5Xh41o4',
    label: 'Ryan',
    subLabel: 'Middle-aged American Male',
  },
  {
    value: '9nzkeHzEoaPxVhXEsNoa',
    label: 'Neal',
    subLabel: 'Old American Male',
  },
  {
    value: 'qMCUephXYfExAD5cBh9I',
    label: 'Bria',
    subLabel: 'Young American Female',
  },
  {
    value: 'R32W1d8VARnU5XFvq1Ye',
    label: 'Oliva',
    subLabel: 'Young American Female',
  },
  {
    value: 'UCzsQsWassSRb5fzTz4n',
    label: 'Joanne',
    subLabel: 'Young American Female',
  },
  {
    value: 'd8pPmZIJPvpmzkyAkqvw',
    label: 'Silas',
    subLabel: 'Middle-aged British Male',
  },
  {
    value: 'mxTY03qcGpDg73QR0yav',
    label: 'Valentino',
    subLabel: 'Old British Male',
  },
  {
    value: 'H5rToP8XhZQGhaRmRhiF',
    label: 'Ella',
    subLabel: 'Young British Female',
  },
  {
    value: 'vXk7WfJ3mZMtkanQnMBZ',
    label: 'Victoria',
    subLabel: 'Middle-aged British Female',
  },
  {
    value: 'iLAV0tXKz7HqYZtIrTFb',
    label: 'Arjun',
    subLabel: 'Young Indian Male',
  },
  {
    value: 'mjUKfJTseyFaK1DwV0T6',
    label: 'Sanjay',
    subLabel: 'Middle-aged Indian Male',
  },
  {
    value: 'jw4AE73lg06vKdYhYehx',
    label: 'Anika',
    subLabel: 'Young Indian Female',
  },
  {
    value: '608vEE74f3JIP5G40lUo',
    label: 'Priya',
    subLabel: 'Young Indian Female',
  },
  {
    value: '9Pziu38hrzpxETfc495R',
    label: 'Kwame',
    subLabel: 'Young African Male',
  },
  {
    value: 'kqgosElwT9KGKsJEuTin',
    label: 'Tyrell',
    subLabel: 'Middle-aged African Male',
  },
  {
    value: 'XyYFUdqPOqX6tW5OkcqR',
    label: 'Okole',
    subLabel: 'Old African Male',
  },
  {
    value: '3uj8kpsaVjLOqU5Rs1lB',
    label: 'Namoi',
    subLabel: 'Middle-aged African Female',
  },
  {
    value: 'lx8LAX2EUAKftVz0Dk5z',
    label: 'Juan',
    subLabel: 'Young German Male',
  },
  {
    value: 'WczBIOau2qV9z7nLeDqq',
    label: 'Nikolay',
    subLabel: 'Young Russian Male',
  },
];

export function SetNarratorDialog() {
  const isSetNarratorDialogOpen = useDialogStore((state) => state.isSetNarratorDialogOpen);
  const setIsSetNarratorDialogOpen = useDialogStore((state) => state.setIsSetNarratorDialogOpen);

  const narratorPrompt = useLobbyStore((state) => state.narratorPrompt);
  const setNarratorPrompt = useLobbyStore((state) => state.setNarratorPrompt);

  const narratorVoiceId = useLobbyStore((state) => state.narratorVoiceId);
  const setNarratorVoiceId = useLobbyStore((state) => state.setNarratorVoiceId);

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
