'use client';

import { ReactNode } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

// project import

// ==============================|| MAIN LAYOUT ||============================== //

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  // const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      {/* <Header /> */}
      <Box
        component="main"
        sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />
        <Container
          maxWidth={'xl'}
          sx={{
            // ...(container && { px: { xs: 0, sm: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
          {/* <Footer /> */}
        </Container>
      </Box>
      {/* <AddCustomer /> */}
    </Box>
  );
}
