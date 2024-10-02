import { Box, BoxProps } from '@mui/material';
import { ProgressIndicator } from '../progress-indicator/progress-indicator';

 
export interface PageLoadingProps extends BoxProps {
  type?: 'linear' | 'circular' | 'notional';
}

export function PageLoading({ sx = {}, type }: PageLoadingProps) {
  const sxOverrides = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    py: 10,
    ...sx,
  };
  return (
    <Box sx={sxOverrides}>
      <ProgressIndicator type={type} />
    </Box>
  );
}

export default PageLoading;
