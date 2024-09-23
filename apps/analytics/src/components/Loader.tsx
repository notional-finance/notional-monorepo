// material-ui
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ==============================|| LOADER ||============================== //

export default function Loader() {
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, zIndex: 2001, width: '100%' }}>
      <LinearProgress color="primary" />
    </Box>
  );
}
