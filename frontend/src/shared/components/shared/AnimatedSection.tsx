import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';

interface AnimatedSectionProps extends BoxProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedSection = ({
  children,
  delay = 0,
  direction = 'up',
  ...boxProps
}: AnimatedSectionProps) => {
  const directionVariants = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  return (
    <Box
      component={motion.div}
      initial={{
        opacity: 0,
        ...directionVariants[direction],
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      {...boxProps}
    >
      {children}
    </Box>
  );
};

export default AnimatedSection;





