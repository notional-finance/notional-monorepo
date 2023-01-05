import { Box, BoxProps } from '@mui/material';
import { ProgressIndicator } from '../progress-indicator/progress-indicator';

/* eslint-disable-next-line */
export interface PageLoadingProps extends BoxProps {
  type?: 'linear' | 'circular' | 'notional';
}

export function PageLoading({ sx = {}, type }: PageLoadingProps) {
  const sxOverrides = {
    ...sx,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    py: 10,
  };
  return (
    <Box sx={sxOverrides}>
      <ProgressIndicator type={type} />
    </Box>
  );
}

export default PageLoading;
