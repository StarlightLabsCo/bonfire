'use client';

import { motion } from 'framer-motion';

export default function Bounce({ children, className }: { children: React.ReactNode; className?: string }) {
  const bounceAnimation = {
    y: ['-25%', '0%', '-25%'],
    transition: {
      duration: 1,
      ease: ['easeInOut', 'easeOut', 'easeInOut'],
      times: [0, 0.5, 1],
      repeat: Infinity,
    },
  };

  return (
    <motion.div className={className} animate={bounceAnimation}>
      {children}
    </motion.div>
  );
}
