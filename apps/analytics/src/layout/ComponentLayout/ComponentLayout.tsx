'use client';

import { ReactNode } from 'react';

// material-ui
import { styled, useTheme, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project import

import { DRAWER_WIDTH } from 'config';

// components content
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }: { theme: Theme; open: boolean }) => ({
  minHeight: `calc(100vh - 188px)`,
  width: `calc(100% - ${DRAWER_WIDTH}px)`,
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  [theme.breakpoints.down('md')]: {
    paddingLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

interface Props {
  children: ReactNode;
}

// ==============================|| COMPONENTS LAYOUT ||============================== //

export default function ComponentsLayout({ children }: Props) {
  const theme = useTheme();

  return <Box sx={{ display: 'flex' }}></Box>;
}
