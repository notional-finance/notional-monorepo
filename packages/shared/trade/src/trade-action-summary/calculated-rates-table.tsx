import { Box } from '@mui/material';
import { LEND_BORROW } from '@notional-finance/utils';
import { DataTable } from '@notional-finance/mui';
import { useCalculatedRates } from './use-calculated-rates';
import { defineMessage } from 'react-intl';

interface CalculatedRatesTableProps {
  selectedToken: string;
  selectedMarketKey: string | null;
  tradeAction: LEND_BORROW;
}

export const CalculatedRatesTable = ({
  selectedToken,
  selectedMarketKey,
  tradeAction,
}: CalculatedRatesTableProps) => {
  const { tableData, tableColumns } = useCalculatedRates(
    selectedToken,
    selectedMarketKey,
    tradeAction
  );

  return (
    <Box sx={{ margin: '0 15px' }}>
      <DataTable
        data={tableData}
        columns={tableColumns}
        tableTitle={defineMessage({
          defaultMessage: 'Calculated Interest Rates',
          description: 'Calculated Interest Rates Table Title',
        })}
      />
    </Box>
  );
};
