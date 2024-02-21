'use client';

import CustomStoryEditor from '@/components/pages/lobby/custom/custom-story-editor';
import { SuggestedStories } from '@/components/pages/lobby/recommendations/suggested-stories';
import { useLobbyStore } from '@/stores/lobby-store';
import { useState } from 'react';

export default function Lobby() {
  const [isCustom, setIsCustom] = useState(false);

  const createInstance = useLobbyStore((state) => state.createInstance);

  return (
    <div className="min-h-[calc(100dvh-2.5rem)] w-full mt-10 flex flex-col gap-y-2 items-center">
      <div className={`flex w-full px-4 items-center justify-center gap-x-2 text-neutral-400 text-xs font-light mt-2`}>
        <div
          className={`${!isCustom ? 'text-white font-bold' : 'text-neutral-400'} hover:text-neutral-200 w-14 flex justify-center cursor-pointer`}
          onClick={() => setIsCustom(false)}
        >
          For You
        </div>
        <div>|</div>
        <div
          className={`${isCustom ? 'text-white font-bold' : 'text-neutral-400'} hover:text-neutral-200 w-14 flex justify-center cursor-pointer`}
          onClick={() => setIsCustom(true)}
        >
          Custom
        </div>
      </div>
      {isCustom ? <CustomStoryEditor className="grow" /> : <SuggestedStories className="my-5" />}
      <div
        onClick={() => createInstance()}
        className="rounded-full grow-0 shrink-0 w-24 h-12 bg-[#ff8f00] text-white z-10 flex items-center justify-center font-black text-xl my-8 cursor-pointer hover:scale-105"
      >
        Play
      </div>
    </div>
  );
}
