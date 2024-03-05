'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FadeIn({
  children,
  className,
  delay,
  viewTriggerOffset,
  x,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  noVertical?: boolean;
  delay?: number;
  viewTriggerOffset?: boolean;
  x?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: viewTriggerOffset ? '-128px' : '0px',
  });

  const fadeVariants = {
    initial: {
      opacity: 0,
      y: y || 0,
      x: x || 0,
    },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={inView ? 'animate' : 'initial'}
      variants={fadeVariants}
      className={className}
      initial={false}
      transition={{
        duration: 0.6,
        delay: delay || 0,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
