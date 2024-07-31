import { ReactNode } from 'react';

// material-ui
import Box from '@mui/material/Box';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

// ==============================|| PROGRESS - LINEAR ICON ||============================== //

export default function LinearWithIcon({ icon, value, ...others }: LinearProgressProps & { icon: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>{icon}</Box>
    </Box>
  );
}
