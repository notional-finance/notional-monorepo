import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';
import { SmallTableCell } from '../../typography/typography';

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
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {iconZero && <TokenIcon symbol={icons[0] || 'unknown'} size="small" />}
      {iconOne && <Box sx={{ margin: theme.spacing(0.5) }}>/</Box>}
      {iconOne && <TokenIcon symbol={icons[1] || 'unknown'} size="small" />}
      <SmallTableCell
        sx={{
          color: theme.palette.typography.main,
          marginLeft: iconOne || iconZero ? theme.spacing(0.5) : undefined,
        }}
      >
        {type}
      </SmallTableCell>
    </Box>
  );
};

export default TextWithIconCell;
