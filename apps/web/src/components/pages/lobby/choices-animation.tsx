'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type ChoicesAnimationProps = {
  className?: string;
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

// Node Variants
const baseNodeVariants = {
  hidden: { opacity: 0, scale: 0, offsetDistance: '100%' },
  visible: { opacity: 1, scale: 1 },
};

const sourceNodeVariants = {
  ...baseNodeVariants,
};

const selectedLeafVariants = {
  ...baseNodeVariants,
  selected: {},
  becomeSource: { offsetDistance: '0%' },
};

const nonSelectedLeafVariants = {
  ...baseNodeVariants,
  exit: { opacity: 0, scale: 0 },
};

// Edge Variants
const baseEdgeVariants = {
  hidden: { pathLength: 0, opacity: 1, stroke: 'rgba(255, 255, 255, 0.3)' },
  visible: { pathLength: 1, transition: { duration: 1.5, ease: 'easeInOut' } },
};

const nonSelectedEdgeVariants = {
  ...baseEdgeVariants,
  exit: { opacity: 0 },
};

const selectedEdgeVariants = {
  ...baseEdgeVariants,
  selected: { stroke: 'rgba(255, 255, 255, 0.5)' },
  becomeSource: { pathLength: 0 },
};

export function ChoicesAnimation({ className }: ChoicesAnimationProps) {
  // Base Animation
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  // Source Node
  const sourceRef = useRef<HTMLDivElement>(null);
  const [sourceNodeImage, setSourceNodeImage] = useState('/animations/multiplayer/host.webp');

  // Edges
  const edgesParentRef = useRef<SVGSVGElement>(null);
  const [pathDs, setPathDs] = useState(['', '', '']);

  const updatePathDs = (index: number, pathD: string) => {
    setPathDs((prevPathDs) => {
      const newPathDs = [...prevPathDs];
      newPathDs[index] = pathD;
      return newPathDs;
    });
  };

  // Leaf nodes
  const leafRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [leafStyles, setLeafStyles] = useState(['left-1/2 ', 'left-1/2 top-1/2 -mt-[2rem]', 'left-1/2 bottom-0']);
  const [leafOffsetPaths, setLeafOffsetPaths] = useState(['', '', '']);

  const updateLeafOffsetPath = (index: number, pathD: string) => {
    setLeafOffsetPaths((prevLeafOffsetPaths) => {
      const newLeafOffsetPaths = [...prevLeafOffsetPaths];
      newLeafOffsetPaths[index] = pathD;
      return newLeafOffsetPaths;
    });
    console.log('updateLeafOffsetPath', index, pathD);
  };

  const [leafImages, setLeafImages] = useState([
    '/animations/multiplayer/host.webp',
    '/animations/multiplayer/host.webp',
    '/animations/multiplayer/host.webp',
  ]);

  const [selectedLeafIndex, setSelectedLeafIndex] = useState<number | null>(null);

  // Effects

  // Draw edges
  useEffect(() => {
    const parentRect = edgesParentRef.current?.getBoundingClientRect();
    if (!parentRect) return;

    leafRefs.forEach((ref, index) => {
      if (ref.current) {
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Adjust calculations to be relative to the parent element
        const endX = left + width / 2 - parentRect.left;
        const endY = top + height / 2 - parentRect.top;

        // Define the start point (source node)
        const startX = 32;
        const startY = 120;

        // Define control points for the Bezier curve
        const controlX1 = (startX + endX) / 2;
        const controlY1 = startY;
        const controlX2 = (startX + endX) / 2;
        const controlY2 = endY;

        // Set the path data using a cubic Bezier curve
        updatePathDs(index, `M${startX},${startY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`);
        updateLeafOffsetPath(index, `M${startX},${startY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`);
      }
    });
    setLeafStyles(['', '', '']);
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      // controls.start('visible').then(() => {
      //   setTimeout(() => {
      //     selectLeaf();
      //   }, 2000);
      // });
    }
  }, [controls, inView]);

  useEffect(() => {
    if (selectedLeafIndex === null) return;

    const triggerProgression = async () => {
      controls.start('exit');
      await controls.start('selected');
      await controls.start('becomeSource');

      setSourceNodeImage(leafImages[selectedLeafIndex]);

      controls.set('hidden');

      setLeafImages([
        '/animations/multiplayer/friend1.webp',
        '/animations/multiplayer/friend2.webp',
        '/animations/multiplayer/friend3.webp',
      ]);
      setSelectedLeafIndex(null);

      setTimeout(() => {
        controls.start('visible');
      }, 1000);
    };

    triggerProgression();
  }, [selectedLeafIndex, controls, leafImages]);

  return (
    <div ref={ref} className={cn('w-full relative h-60', className)}>
      {/* Source Node */}
      <motion.div
        ref={sourceRef}
        variants={sourceNodeVariants}
        initial="hidden"
        animate="visible"
        transition={transition}
        className="absolute top-1/2 -mt-[2rem] z-10"
      >
        <Image
          src={sourceNodeImage}
          alt="Source Node"
          height={1024}
          width={1024}
          className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
        />
      </motion.div>

      {/* Edges */}
      <motion.svg ref={edgesParentRef} variants={baseEdgeVariants} initial="hidden" animate={controls} className="absolute w-full h-full">
        {pathDs.map((pathD, index) => (
          <motion.path
            key={index}
            d={pathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
            variants={selectedLeafIndex === index ? selectedEdgeVariants : nonSelectedEdgeVariants}
            transition={transition}
          />
        ))}
      </motion.svg>

      {/* Leaves */}
      {leafRefs.map((ref, index) => (
        <motion.div
          key={index}
          variants={selectedLeafIndex === index ? selectedLeafVariants : nonSelectedLeafVariants}
          initial="hidden"
          animate={controls}
          transition={transition}
          className={`absolute ${leafStyles[index]} z-10`}
          style={{
            offsetPath: `path("${leafOffsetPaths[index]}")`,
          }}
          ref={ref}
          onClick={() => setSelectedLeafIndex(index)}
        >
          <Image
            src={leafImages[index]}
            alt={`Leaf Node`}
            height={1024}
            width={1024}
            className="h-16 w-16 rounded-full border border-white/30 drop-shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}
