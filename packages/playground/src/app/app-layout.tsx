import { Box, Typography, AppBar, Toolbar, Button } from '@mui/material';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import WalletDisplay from './components/wallet-display';

export const AppLayout = () => {
  return (
    <Box
      sx={{ mx: '2rem', my: '1rem', display: 'flex', flexDirection: 'column' }}
    >
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SDK Playground
          </Typography>
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Button
              component={RouterLink}
              to="/network"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              network
            </Button>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <WalletDisplay />
          </Box>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', mt: '4rem', justifyContent: 'center' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
