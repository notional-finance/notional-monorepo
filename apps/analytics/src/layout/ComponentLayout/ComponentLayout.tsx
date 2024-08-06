'use client';

import { ReactNode } from 'react';

// material-ui
import Box from '@mui/material/Box';

// project import

interface Props {
  children: ReactNode;
}

// ==============================|| COMPONENTS LAYOUT ||============================== //

export default function ComponentsLayout({ children }: Props) {
  return <Box sx={{ display: 'flex' }}></Box>;
}
