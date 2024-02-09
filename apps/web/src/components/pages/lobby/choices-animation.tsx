'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ChoicesAnimationProps = {
  className?: string;
};

const nodeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

const sourceNodeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

const transition = {
  duration: 1,
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

const edgeVariants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 2, ease: 'easeInOut' } },
};

export function ChoicesAnimation({ className }: ChoicesAnimationProps) {
  const controls = useAnimation();

  const edgesParentRef = useRef<SVGSVGElement>(null);

  const firstLeafRef = useRef<HTMLDivElement>(null);
  const [firstPathD, setFirstPathD] = useState('');

  const secondLeafRef = useRef<HTMLDivElement>(null);
  const [secondPathD, setSecondPathD] = useState('');

  const thirdLeafRef = useRef<HTMLDivElement>(null);
  const [thirdPathD, setThirdPathD] = useState('');

  useEffect(() => {
    controls.start('visible').then(() => {
      setTimeout(() => controls.start('focused'), 2000);
    });
  }, [controls]);

  useEffect(() => {
    const parentRect = edgesParentRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    const leafRefs = [firstLeafRef, secondLeafRef, thirdLeafRef];
    const setPathDs = [setFirstPathD, setSecondPathD, setThirdPathD];

    leafRefs.forEach((ref, index) => {
      if (ref.current) {
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Adjust calculations to be relative to the parent element
        const centerX = left + width / 2 - parentRect.left;
        const centerY = top + height / 2 - parentRect.top;

        setPathDs[index](`M32,120 L${centerX},${centerY}`);
      }
    });
  }, []);

  return (
    <div className={cn('w-full relative h-60 border border-red-500', className)}>
      {/* Source Node */}
      <motion.div
        variants={sourceNodeVariants}
        initial="hidden"
        animate="visible"
        transition={transition}
        className="absolute top-1/2 -mt-[2rem]"
      >
        <Image
          src="/multiplayer/host.webp"
          alt="Source Node"
          height={1024}
          width={1024}
          className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
        />
      </motion.div>

      {/* Edges */}
      <motion.svg ref={edgesParentRef} variants={edgeVariants} initial="hidden" animate="visible" className="absolute w-full h-full">
        <motion.path d={firstPathD} fill="none" stroke="red" strokeWidth="2" variants={edgeVariants} />
        <motion.path d={secondPathD} fill="none" stroke="red" strokeWidth="2" variants={edgeVariants} />
        <motion.path d={thirdPathD} fill="none" stroke="red" strokeWidth="2" variants={edgeVariants} />
      </motion.svg>

      {/* Leaves */}
      <motion.div
        variants={nodeVariants}
        initial="hidden"
        animate={controls}
        transition={transition}
        className="absolute left-1/2"
        ref={firstLeafRef}
      >
        <Image
          src="/multiplayer/host.webp"
          alt={`Leaf Node`}
          height={1024}
          width={1024}
          className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
        />
      </motion.div>
      <motion.div
        variants={nodeVariants}
        initial="hidden"
        animate={controls}
        transition={transition}
        className="absolute left-1/2 top-1/2 -translate-y-[2rem] -mt-[2rem]"
        ref={secondLeafRef}
      >
        <Image
          src="/multiplayer/host.webp"
          alt={`Leaf Node`}
          height={1024}
          width={1024}
          className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
        />
      </motion.div>
      <motion.div
        variants={nodeVariants}
        initial="hidden"
        animate={controls}
        transition={transition}
        className="absolute left-1/2 bottom-0"
        ref={thirdLeafRef}
      >
        <Image
          src="/multiplayer/host.webp"
          alt={`Leaf Node`}
          height={1024}
          width={1024}
          className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
        />
      </motion.div>
    </div>
  );
}
