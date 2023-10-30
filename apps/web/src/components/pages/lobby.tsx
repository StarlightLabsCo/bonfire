'use client';

import { useEffect, useState } from 'react';
import { User } from 'next-auth';
import { useMessages } from '../contexts/messages-context';
import { useAudioProcessor } from '../contexts/audio-context';
import { OpenSidebar } from '../open-sidebar';
import { LobbyInput } from '../input/lobby-input';
import { cn } from '@/lib/utils';
import { useWebSocket } from '../contexts/ws-context';

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
  const [imageIndex, setImageIndex] = useState(
    Math.floor(Math.random() * imageUrls.length),
  );
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [imageURL, setImageURL] = useState(imageUrls[imageIndex]);
  const [animated, setAnimated] = useState(false);

  const { setMessages } = useMessages();
  const { setTranscription, clearAudio } = useAudioProcessor();
  const { setInstanceId, sendJSON } = useWebSocket();

  const [submitted, setSubmitted] = useState(false);
  const [loadingMessageVisible, setLoadingMessageVisible] = useState(false);

  // clear messages and transcription
  useEffect(() => {
    setMessages([]);
    setTranscription('');
    clearAudio();
    if (setInstanceId) setInstanceId(null);
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

          setCurrentMessageIndex(
            (prevIndex) => (prevIndex + 1) % loadingMessages.length,
          );

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
    <div className="flex flex-col items-center justify-center w-full h-full p-5 gap-y-5 grow">
      <OpenSidebar />
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
      <LobbyInput
        userId={user.id}
        submitted={submitted}
        setSubmitted={setSubmitted}
      />
      <span key={currentMessageIndex} className={cn('h-10')}>
        {loadingMessageVisible && loadingMessages[currentMessageIndex]}
      </span>
    </div>
  );
}
