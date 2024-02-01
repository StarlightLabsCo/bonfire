'use client';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialog-store';

type SettingsProps = {
  submitted: boolean;
};

export function Settings({ submitted }: SettingsProps) {
  const setIsSetNarratorDialogOpen = useDialogStore((state) => state.setIsSetNarratorDialogOpen);
  const setIsSetStoryOutlineDialogOpen = useDialogStore((state) => state.setIsSetStoryOutlineDialogOpen);
  const setIsSetImageStyleDialogOpen = useDialogStore((state) => state.setIsSetImageStyleDialogOpen);

  return (
    <div className={cn('mt-auto mb-3', submitted && 'cursor-not-allowed fade-out-2s')}>
      <div className="flex items-center mb-3">
        <div className="grow h-[0.5px] border-[0.5px] border-white/10 rounded-full px-1" />
        <div className="text-neutral-500 font-light text-xs mx-1 cursor-default">Settings</div>
        <div className="grow h-[0.5px] border-[0.5px] border-white/10 rounded-full px-1" />
      </div>
      <div className="flex gap-x-4">
        <div
          className="flex flex-col items-center justify-center border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 border-[0.5px] rounded-lg h-20 w-20 gap-y-2 cursor-pointer"
          onClick={() => setIsSetNarratorDialogOpen(true)}
        >
          <Icons.person className="h-6 w-6" />
          <div className="text-xs">Narrator</div>
        </div>
        <div
          className="flex flex-col items-center justify-center border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500  border-[0.5px] rounded-lg h-20 w-20 gap-y-2 cursor-pointer"
          onClick={() => setIsSetStoryOutlineDialogOpen(true)}
        >
          <Icons.book className="h-6 w-6" />
          <div className="text-xs">Outline</div>
        </div>
        <div
          className="flex flex-col items-center justify-center border-neutral-900 hover:border-neutral-800 text-neutral-600 hover:text-neutral-500 border-[0.5px] rounded-lg h-20 w-20 gap-y-2 cursor-pointer"
          onClick={() => setIsSetImageStyleDialogOpen(true)}
        >
          <Icons.image className="h-6 w-6" />
          <div className="text-xs">Style</div>
        </div>
      </div>
    </div>
  );
}
