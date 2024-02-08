'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function TriggeredFadeIn({
  animated,
  children,
  className,
  noVertical,
  yValue,
  delay,
  viewTriggerOffset,
}: {
  animated?: boolean;
  children: React.ReactNode;
  className?: string;
  noVertical?: boolean;
  yValue?: number;
  delay?: number;
  viewTriggerOffset?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: viewTriggerOffset ? '-128px' : '0px',
  });

  const fadeUpVariants = {
    initial: {
      opacity: 0,
      y: noVertical ? 0 : yValue || 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      animate={inView && animated ? 'animate' : 'initial'}
      variants={fadeUpVariants}
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
