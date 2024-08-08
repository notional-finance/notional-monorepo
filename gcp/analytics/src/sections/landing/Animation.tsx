import React, { useEffect, useRef } from 'react';

// third party
import { motion, useAnimation, useInView } from 'framer-motion';

// =============================|| LANDING - FADE IN ANIMATION ||============================= //

export default function Animation({ children, variants }: { children: React.ReactElement; variants: any }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{
        x: {
          type: 'spring',
          stiffness: 150,
          damping: 30,
          duration: 0.5
        },
        opacity: { duration: 1 }
      }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
