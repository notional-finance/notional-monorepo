import { TokenIcon } from '@notional-finance/icons';
import { Box } from '@mui/material';

export interface TextWithIconCellProps {
  cell: {
    value: {
      type: string;
      icons?: string[];
    };
  };
}

export const TextWithIconCell = ({
  cell: {
    value: { type, icons },
  },
}: TextWithIconCellProps): JSX.Element => {
  const iconZero = icons && icons[0];
  const iconOne = icons && icons[1];
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {iconZero && <TokenIcon symbol={icons[0] || 'unknown'} size="small" />}
      {iconOne && <Box sx={{ margin: '3px' }}>/</Box>}
      {iconOne && <TokenIcon symbol={icons[1] || 'unknown'} size="small" />}
      <Box sx={{ marginLeft: iconOne || iconZero ? '5px' : '' }}>{type}</Box>
    </Box>
  );
};

export default TextWithIconCell;
