import { Box, useTheme } from '@mui/material';
import { LargeTableCell } from '../../typography/typography';
import { TokenIcon } from '@notional-finance/icons';

export const ExpandableCurrencyCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { symbol, label } = cell.getValue();

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
      <LargeTableCell sx={{ marginLeft: '10px' }}>
        {label || symbol}
      </LargeTableCell>
    </Box>
  );
};

export default ExpandableCurrencyCell;
