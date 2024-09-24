'use client';

import { ReactNode } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

// project import
import Header from './Header';
import Footer from './Footer';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import AddCustomer from 'sections/apps/customer/AddCustomer';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';

// ==============================|| MAIN LAYOUT ||============================== //

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const { container, menuOrientation } = useConfig();

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Header />
      <Box component="main" sx={{ width: 'calc(100% - 260px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: isHorizontal ? 8 : 'inherit' }} />
        <Container
          maxWidth={container ? 'xl' : false}
          sx={{
            ...(container && { px: { xs: 0, sm: 2 } }),
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Breadcrumbs />
          {children}
          <Footer />
        </Container>
      </Box>
      <AddCustomer />
    </Box>
  );
}
