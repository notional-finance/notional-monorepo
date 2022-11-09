import { Box, BoxProps } from '@mui/material';
import { ProgressIndicator } from '../progress-indicator/progress-indicator';

/* eslint-disable-next-line */
export interface PageLoadingProps extends BoxProps {}

export function PageLoading({ sx = {} }: PageLoadingProps) {
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
      <ProgressIndicator />
    </Box>
  );
}

export default PageLoading;
