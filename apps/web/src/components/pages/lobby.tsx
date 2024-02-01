'use client';

import { useEffect, useState } from 'react';
import { LobbyInput } from '../input/lobby-input';
import { useCurrentInstanceStore } from '@/stores/current-instance-store';
import { useMessagesStore } from '@/stores/messages-store';
import { usePlaybackStore } from '@/stores/audio/playback-store';
import { useLobbyStore } from '@/stores/lobby-store';
import { ImagePreview } from './lobby/image-preview';
import { Settings } from './lobby/settings';

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

export function Lobby({ imageUrls }: { imageUrls: string[] }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const setDescription = useLobbyStore((state) => state.setDescription);
  const setMessages = useMessagesStore((state) => state.setMessages);
  const clearAudio = usePlaybackStore((state) => state.clearAudio);
  const setInstanceId = useCurrentInstanceStore((state) => state.setInstanceId);

  const [submitted, setSubmitted] = useState(false);
  const [loadingMessageVisible, setLoadingMessageVisible] = useState(false);

  // clear messages and transcription on each lobby load
  useEffect(() => {
    setDescription('');
    setMessages([]);
    clearAudio();
    setInstanceId(null);
  }, []);

  useEffect(() => {
    if (submitted) {
      setTimeout(() => {
        setLoadingMessageVisible(true);
      }, 2000);
    }
  }, [submitted]);

  return (
    <div className="w-full h-[100dvh] flex flex-col items-center gap-y-5 pt-10">
      <ImagePreview imageUrls={imageUrls} />
      <LobbyInput submitted={submitted} setSubmitted={setSubmitted} />
      <span key={currentMessageIndex} className={'h-10'}>
        {loadingMessageVisible && loadingMessages[currentMessageIndex]}
      </span>
      <Settings submitted={submitted} />
    </div>
  );
}
