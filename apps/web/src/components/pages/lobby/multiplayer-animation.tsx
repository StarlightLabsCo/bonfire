'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';

type MultiplayerAnimationProps = {
  className?: string;
};

const friends = [
  { id: '1', imageUrl: '/animations/multiplayer/friend1.webp' },
  { id: '2', imageUrl: '/animations/multiplayer/friend2.webp' },
  { id: '3', imageUrl: '/animations/multiplayer/friend3.webp' },
  { id: '4', imageUrl: '/animations/multiplayer/friend4.webp' },
  { id: '5', imageUrl: '/animations/multiplayer/friend5.webp' },
];

export function MultiplayerAnimation({ className }: MultiplayerAnimationProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [hostImage, setHostImage] = useState(
    Math.random() > 0.5 ? '/animations/multiplayer/host.webp' : '/animations/multiplayer/host2.webp',
  );
  const [visibleFriends, setVisibleFriends] = useState<number[]>([]);
  const timeRef = useRef(0);
  const firstRender = useRef(true);

  // Timing control
  const initialDelay = 1.5; // Delay in seconds before any friends start appearing
  const appearanceDelay = 0.2; // Delay in seconds between friends appearing
  const visibilityDuration = 4; // Duration in seconds all friends stay visible
  const totalAppearanceTime = appearanceDelay * friends.length;
  const cycleTime = totalAppearanceTime + visibilityDuration + initialDelay; // Total cycle time including the initial delay

  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | undefined;

    const animate = (currentTime: number) => {
      if (lastTime === undefined) {
        lastTime = currentTime;
      }
      const deltaTime = (currentTime - lastTime) / 1000; // Convert time difference to seconds
      lastTime = currentTime;

      timeRef.current += deltaTime;

      let cycleProgress = timeRef.current % cycleTime;
      if (firstRender.current) {
        cycleProgress += initialDelay; // Skip initial delay on first render
        firstRender.current = false; // Ensure this adjustment only happens once
      }

      if (cycleProgress < initialDelay) {
        // During the initial delay phase
        setVisibleFriends([]);
      } else if (cycleProgress < totalAppearanceTime + initialDelay) {
        // Adjusted for the initial delay
        const visibleCount = Math.floor((cycleProgress - initialDelay) / appearanceDelay) + 1;
        setVisibleFriends(friends.slice(0, visibleCount).map((_, index) => index));
      } else {
        // During the visibility phase
        setVisibleFriends(friends.map((_, index) => index));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (inView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [inView]);

  const calculatePosition = (index: number, total: number, time: number) => {
    const offsetRadians = Math.PI / 2;
    const angleIncrement = (2 * Math.PI) / total;
    // Adjust angle based on time to rotate positions
    const angle = angleIncrement * index - offsetRadians + time * 0.28;
    const radius = 45;
    return {
      left: `calc(${50 + radius * Math.cos(angle)}% - 2rem)`, // half the width of the friend image
      top: `calc(${50 + radius * Math.sin(angle)}% - 2rem)`,
    };
  };

  const variants = {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0 },
  };

  const transition = {
    opacity: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      mass: 1,
    },
    scale: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      mass: 1,
    },
    ease: 'easeInOut',
  };

  return (
    <div className={cn('w-full flex items-center justify-center', className)}>
      <div ref={ref} className="h-64 w-64">
        <div className={'relative w-full h-full rounded-full flex justify-center items-center'}>
          <Image
            src={hostImage}
            alt="Host"
            className="absolute w-24 h-24 rounded-full border border-white/30 drop-shadow-lg"
            height={1024}
            width={1024}
          />
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              animate={visibleFriends.includes(index) ? 'visible' : 'hidden'}
              variants={variants}
              initial="hidden"
              transition={transition}
              className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2"
              style={calculatePosition(index, friends.length, timeRef.current)}
            >
              <Image
                src={friend.imageUrl}
                alt={`Friend ${index + 1}`}
                height={1024}
                width={1024}
                className="absolute rounded-full border border-white/30 drop-shadow-lg"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
