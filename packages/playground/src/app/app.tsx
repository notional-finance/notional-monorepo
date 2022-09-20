import { Box, Typography } from '@mui/material';
import {
  initializeNetwork,
  useNotionalError,
} from '@notional-finance/notionable';
import { useCallback, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AppLayout } from './app-layout';
import Home from './home';
import Network from './network';
import { ServerError } from './server-error';

export function App() {
  const navigate = useNavigate();
  const { error } = useNotionalError();

  const initApplication = useCallback(async () => {
    try {
      await initializeNetwork({ container: '#onboard' });
    } catch (error) {
      navigate('/500');
      console.error(error);
    }
  }, [navigate]);

  useEffect(() => {
    initApplication();
  }, []);

  useEffect(() => {
    if (error && error.code === 500) {
      navigate('/500');
    }
  }, [error, navigate]);

  return (
    <Box
      sx={{ mx: '2rem', my: '1rem', display: 'flex', flexDirection: 'column' }}
    >
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="network" element={<Network />} />
          <Route path="500" element={<ServerError />} />
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
