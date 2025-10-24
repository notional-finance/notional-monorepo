import { Box } from '@mui/material';
import TokenIcon from '../token-icon/token-icon';

export interface MultiTokenIconProps {
  symbols: (string | undefined)[];
  size: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  shiftSize?: number;
}

export function MultiTokenIcon({
  symbols,
  size,
  shiftSize,
}: MultiTokenIconProps) {
  const tokenShift = {
    small: 10,
    medium: 14,
    large: 10,
    xl: 20,
    xxl: 40,
  };
  const shift = shiftSize ?? tokenShift[size];

  const tokenSizes = {
    small: '16px',
    medium: '24px',
    large: '32px',
    xl: '48px',
    xxl: '72px',
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: `${-shift * (symbols.length - 1)}px`,
        height: tokenSizes[size],
      }}
    >
      {symbols
        .filter((symbol) => symbol !== undefined)
        .map((symbol, index) => (
          <Box
            key={symbol}
            sx={{
              position: 'relative',
              right: `${shift * index}px`,
              zIndex: index,
              height: '100%',
            }}
          >
            <TokenIcon size={size} symbol={symbol} />
          </Box>
        ))}
    </Box>
  );
}
