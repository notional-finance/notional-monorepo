import { SxProps, Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TransitionStatus, Transition } from 'react-transition-group';

const fadeStart = {
  transition: `opacity 150ms ease`,
  opacity: 0,
};

const fadeTransition: Record<TransitionStatus, SxProps> = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 1 },
  exited: { opacity: 0 },
  unmounted: {},
};

const slideStart = {
  transition: `transform 150ms ease`,
  transform: 'translateX(130%)',
};

const slideTransition: Record<TransitionStatus, SxProps> = {
  entering: { transform: 'translateX(130%)' },
  entered: { transform: 'translateX(0)' },
  exiting: { transform: 'translateX(0)' },
  exited: { transform: 'translateX(130%)' },
  unmounted: {},
};

export const DrawerTransition = ({
  fade,
  children,
}: {
  fade?: boolean;
  children: React.ReactNode | React.ReactNode[];
}) => {
  const ref = useRef(null);
  const [inState, setInState] = useState(false);

  useEffect(() => {
    setInState(true);
    return () => setInState(false);
    // NOTE: ensure this cleanup function only triggers once for the unmount
    // transition animation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Transition nodeRef={ref} in={inState} timeout={300}>
      {(state: TransitionStatus) => (
        <Box
          ref={ref}
          sx={
            // Root drawer has a different fade in state
            fade
              ? {
                  ...fadeStart,
                  ...fadeTransition[state],
                }
              : {
                  ...slideStart,
                  ...slideTransition[state],
                }
          }
        >
          {children}
        </Box>
      )}
    </Transition>
  );
};
