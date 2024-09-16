'use client';

import { lazy, ReactNode } from 'react';

// material-ui
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

// project import
import ComponentLayoutPage from './ComponentLayout';

const Header = lazy(() => import('./Header'));

// ==============================|| COMPONENTS LAYOUT ||============================== //

interface Props {
  children: ReactNode;
}

export default function ComponentLayout({ children }: Props) {
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
      <Header />
      <Toolbar sx={{ my: 2 }} />
      <ComponentLayoutPage>{children}</ComponentLayoutPage>
    </Container>
  );
}
