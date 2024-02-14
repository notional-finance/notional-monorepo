import { Box } from '@mui/material';
import TokenIcon from '../token-icon/token-icon';

export interface DoubleTokenIconProps {
  symbolTop: string;
  symbolBottom: string;
  size: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
}

export function DoubleTokenIcon({
  symbolTop,
  symbolBottom,
  size,
}: DoubleTokenIconProps) {
  const tokenShift = {
    small: 10,
    medium: 14,
    large: 20,
    xl: 30,
    xxl: 40,
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: `${-tokenShift[size]}px`,
      }}
    >
      <TokenIcon size={size} symbol={symbolTop} style={{ zIndex: 2 }} />
      <Box
        sx={{
          position: 'relative',
          right: `${tokenShift[size]}px`,
          display: 'flex',
          zIndex: 1,
        }}
      >
        <TokenIcon size={size} symbol={symbolBottom} />
      </Box>
    </Box>
  );
}
