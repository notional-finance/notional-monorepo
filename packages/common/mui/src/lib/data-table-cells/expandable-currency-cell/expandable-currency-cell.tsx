import { Box, useTheme } from '@mui/material';
import { LargeTableCell } from '../../typography/typography';
import { TokenIcon } from '@notional-finance/icons';

export interface ExpandableCurrencyCellProps {
  row: {
    isExpanded: boolean;
  };
  cell: {
    value: {
      symbol: string;
      label?: string;
    };
  };
}

export const ExpandableCurrencyCell = ({ cell }: ExpandableCurrencyCellProps): JSX.Element => {
  const theme = useTheme();
  const { symbol, label } = cell.value;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: `${theme.spacing(3)} 0px`,
        width: '100%',
        justifyContent: 'left',
      }}
    >
      <TokenIcon symbol={symbol || 'unknown'} size="medium" />
      <LargeTableCell sx={{ marginLeft: '10px' }}>{label || symbol}</LargeTableCell>
    </Box>
  );
};

export default ExpandableCurrencyCell;
