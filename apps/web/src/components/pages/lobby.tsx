'use client';

import { useEffect, useState } from 'react';
import { User } from 'next-auth';
import { OpenSidebar } from '../open-sidebar';
import { LobbyInput } from '../input/lobby-input';
import { cn } from '@/lib/utils';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useWebsocketStore } from '@/stores/websocket-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { useTranscriptionStore } from '@/stores/audio/transcription-store';
import { Icons } from '../icons';
import { useDialogStore } from '@/stores/dialog-store';
import { useLobbyStore } from '@/stores/lobby-store';

const loadingMessages = [
  'Preparing for adventure',
  'Dusting off the legends',
  'Summoning the winds of fate...',
  'Conjuring realms of mystery...',
  'Unraveling the threads of destiny...',
  'Paving the paths to peril...',
  'Igniting the torches of valor...',
  'Unlocking tales from the cryptic tome...',
  'Charting maps to hidden treasures...',
  'Whispering secrets of the ancients...',
  'Gathering shadows from forgotten realms...',
  "Deciphering the stars' cryptic tales...",
  'Weaving your legendary saga...',
  'Brewing potions of sheer adventure...',
  "Stoking the fires of dragon's breath...",
  'Carving runes of power and prophecy...',
  'Summoning heroes from tales untold...',
  'Inscribing your name in the halls of valor...',
  'Peering into the depths of the abyss...',
  'Consulting the oracles of yore...',
  'Gearing up for quests of yonder...',
  'Entwining the fates of mortals and gods...',
];

export function Lobby({
  user,
  imageUrls,
}: {
  user: {
    id: string;
  } & User;
  imageUrls: string[];
}) {
  const [imageIndex, setImageIndex] = useState(Math.floor(Math.random() * imageUrls.length));
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [imageURL, setImageURL] = useState(imageUrls[imageIndex]);
  const [animated, setAnimated] = useState(false);

  const setDescription = useLobbyStore((state) => state.setDescription);
  const setMessages = useMessagesStore((state) => state.setMessages);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);
  const setTranscription = useTranscriptionStore((state) => state.setTranscription);
  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);

  const [submitted, setSubmitted] = useState(false);
  const [loadingMessageVisible, setLoadingMessageVisible] = useState(false);

  const setIsSetNarratorDialogOpen = useDialogStore((state) => state.setIsSetNarratorDialogOpen);
  const setIsSetStoryOutlineDialogOpen = useDialogStore((state) => state.setIsSetStoryOutlineDialogOpen);
  const setIsSetImageStyleDialogOpen = useDialogStore((state) => state.setIsSetImageStyleDialogOpen);

  // clear messages and transcription on each lobby load
  useEffect(() => {
    console.log(`[Lobby] Clearing messages and transcription`);
    setDescription('');
    setMessages([]);
    setTranscription('');
    clearAudio();
    setInstanceId(null);
  }, []);

  // cycle images
  useEffect(() => {
    const cycleImage = () => {
      setAnimated(true);

      // Set timeout for 2.5 (halfway through the animation) to swap the image
      setTimeout(() => {
        setImageIndex((oldIndex) => {
          const newIndex = (oldIndex + 1) % imageUrls.length;
          setImageURL(imageUrls[newIndex]);

          setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);

          return newIndex;
        });
      }, 2500);

      // After 5s, end the animation (this will align with the completion of the CSS animation)
      setTimeout(() => {
        setAnimated(false);
      }, 5000);
    };

    cycleImage();

    const interval = setInterval(cycleImage, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (submitted) {
      setTimeout(() => {
        setLoadingMessageVisible(true);
      }, 2000);
    }
  }, [submitted]);

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center justify-center gap-y-5 pt-5">
      <div className="relative flex items-center justify-center w-full">
        <div className="relative">
          <img
            className={`absolute inset-0 object-cover h-60 w-60 md:h-80 md:w-80  mx-auto rounded-full opacity-100 aspect-1 blur-lg ${
              animated ? 'animate-background-transition' : ''
            }`}
            src={imageURL}
          />
          <img
            className={`relative object-cover h-60 w-60 md:h-80 md:w-80 mx-auto rounded-full aspect-1 -z-1 ${
              animated ? 'animate-image-transition' : ''
            }`}
            src={imageURL}
          />
        </div>
      </div>
      <LobbyInput submitted={submitted} setSubmitted={setSubmitted} />
      <span key={currentMessageIndex} className={cn('h-10')}>
        {loadingMessageVisible && loadingMessages[currentMessageIndex]}
      </span>
      <div>
        {!submitted && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
