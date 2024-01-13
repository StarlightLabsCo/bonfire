'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDialogStore } from '@/stores/dialog-store';
import { Textarea } from '../ui/textarea';
import { useLobbyStore } from '@/stores/lobby-store';

export function SetImageStyleDialog() {
  const isSetImageStyleDialogOpen = useDialogStore((state) => state.isSetImageStyleDialogOpen);
  const setIsSetImageStyleDialogOpen = useDialogStore((state) => state.setIsSetImageStyleDialogOpen);

  const imageStyle = useLobbyStore((state) => state.imageStyle);
  const setImageStyle = useLobbyStore((state) => state.setImageStyle);

  return (
    <Dialog open={isSetImageStyleDialogOpen} onOpenChange={setIsSetImageStyleDialogOpen}>
      <DialogContent className="h-[100dvh] md:h-3/4 max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Image Style</DialogTitle>
          <DialogDescription>Set the image style for your story. </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col w-full h-full gap-y-5 mt-2">
          <div className="flex flex-col gap-y-1">
            <div>Style</div>
            <Textarea
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
              className="w-full h-20 border-white/10 bg-neutral-900"
            />
            <div className="text-xs mt-1 text-white/50">e.g. line sketch, anime, oil painting, digital art, render, cartoon, etc</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
