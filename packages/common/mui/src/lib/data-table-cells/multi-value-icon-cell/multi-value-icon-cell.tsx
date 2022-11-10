import { SmallTableCell, TableCell } from '../../typography/typography';
import { Box, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';

export interface MultiValueIconCellProps {
  cell: {
    value: {
      symbol: string;
      label: string;
      caption?: string;
    };
  };
}

export const MultiValueIconCell = ({
  cell: {
    value: { symbol, label, caption },
  },
}: MultiValueIconCellProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TokenIcon symbol={symbol || 'unknown'} size="medium" />
      <Box marginLeft={theme.spacing(1)}>
        <TableCell gutter="default">{label}</TableCell>
        <SmallTableCell>{caption || ''}</SmallTableCell>
      </Box>
    </Box>
  );
};

export default MultiValueIconCell;
