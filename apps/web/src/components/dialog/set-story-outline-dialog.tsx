'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialogStore } from '@/stores/dialog-store';
import { Textarea } from '../ui/textarea';
import { useLobbyStore } from '@/stores/lobby-store';

export function SetStoryOutlineDialog() {
  const isSetStoryOutlineDialogOpen = useDialogStore((state) => state.isSetStoryOutlineDialogOpen);
  const setIsSetStoryOutlineDialogOpen = useDialogStore((state) => state.setIsSetStoryOutlineDialogOpen);

  const storyOutline = useLobbyStore((state) => state.storyOutline);
  const setStoryOutline = useLobbyStore((state) => state.setStoryOutline);

  return (
    <Dialog open={isSetStoryOutlineDialogOpen} onOpenChange={setIsSetStoryOutlineDialogOpen}>
      <DialogContent className="h-[100dvh] md:h-3/4 max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Story Outline</DialogTitle>
          <DialogDescription>
            Write a brief outline of the story. Give specific details about characters, locations, and events.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col w-full h-full gap-y-5 mt-2">
          <div className="flex flex-col gap-y-1">
            <div>Outline</div>
            <Textarea
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              value={storyOutline}
              onChange={(e) => setStoryOutline(e.target.value)}
              className="w-full h-60 border-white/10 bg-neutral-900"
            />
            <div className="text-xs mt-1 text-white/50">
              If you fill this out, the main input box will be skipped because it&apos;s used to generate the story outline.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
