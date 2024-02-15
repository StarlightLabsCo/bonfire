'use client';

import { SuggestedStories } from '@/components/pages/lobby/suggested-stories';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function Lobby() {
  const [isCustom, setisCustom] = useState(false);

  return (
    <div className="h-[calc(100dvh-2.5rem)] w-full mt-10 flex flex-col gap-y-2 items-center">
      <div className="flex items-center gap-x-2 text-neutral-400 text-xs font-light mt-5">
        <div>Suggested</div>
        <Switch checked={isCustom} onCheckedChange={setisCustom} />
        <div>Custom</div>
      </div>
      {isCustom ? <div className="grow"></div> : <SuggestedStories className="h-full mt-5" />}
      <div className="rounded-full grow-0 shrink-0 w-24 h-12 bg-[#ff8f00] text-white z-10 flex items-center justify-center font-black text-xl mb-6">
        Play
      </div>
    </div>
  );
}
