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
    large: 20,
    xl: 30,
    xxl: 40,
  };
  const shift = shiftSize ?? tokenShift[size];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: `${-shift * (symbols.length - 1)}px`,
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
              zIndex: symbols.length - index,
            }}
          >
            <TokenIcon size={size} symbol={symbol} />
          </Box>
        ))}
    </Box>
  );
}
