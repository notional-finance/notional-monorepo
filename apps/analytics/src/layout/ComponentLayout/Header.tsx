'use client';

import React from 'react';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// project import
import Logo from 'components/logo';
import AnimateButton from 'components/@extended/AnimateButton';

import { APP_DEFAULT_PATH, ThemeMode } from 'config';
import useUser from 'hooks/useUser';

// ==============================|| COMPONENTS - APP BAR ||============================== //

export default function Header() {
  const theme = useTheme();
  const user = useUser();

  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar sx={{ bgcolor: theme.palette.mode === ThemeMode.DARK ? 'grey.50' : 'grey.800', boxShadow: 'none' }}>
      <Container disableGutters={downMD}>
        <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2 }}>
          <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} alignItems="center">
            <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
              <Logo reverse to="/" />
            </Typography>
            <Chip
              label={process.env.NEXT_APP_VERSION}
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ mt: 0.5, ml: 1, fontSize: '0.725rem', height: 20, '& .MuiChip-label': { px: 0.5 } }}
            />
          </Stack>
          <Stack
            direction="row"
            sx={{
              '& .header-link': { px: 1, '&:hover': { color: 'primary.main' } },
              display: { xs: 'none', md: 'block' }
            }}
            spacing={2}
          >
            <NextLink href={APP_DEFAULT_PATH} passHref legacyBehavior>
              <Link className="header-link" color="white" target="_blank" underline="none">
                Dashboard
              </Link>
            </NextLink>
            <NextLink href="/components-overview/buttons" passHref legacyBehavior>
              <Link className="header-link" color="primary" underline="none">
                Components
              </Link>
            </NextLink>
            <Link className="header-link" color="white" href="https://codedthemes.gitbook.io/mantis/" target="_blank" underline="none">
              Documentation
            </Link>
            <Box sx={{ display: 'inline-block' }}>
              <AnimateButton>
                <Button
                  component={Link}
                  href="https://mui.com/store/items/mantis-react-admin-dashboard-template/"
                  disableElevation
                  color="primary"
                  variant="contained"
                >
                  Purchase Now
                </Button>
              </AnimateButton>
            </Box>
          </Stack>
          <Box sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', display: { xs: 'flex', md: 'none' } }}>
            <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
              <Logo reverse to="/" />
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <NextLink href={user ? APP_DEFAULT_PATH : '/login'} passHref legacyBehavior>
                <Button variant="outlined" size="small" color="warning" sx={{ height: 28 }}>
                  {user ? 'Dashboard' : 'Login'}
                </Button>
              </NextLink>
            </Stack>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
