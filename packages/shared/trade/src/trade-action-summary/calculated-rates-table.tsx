import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { DataTable } from '@notional-finance/mui';
import { useCalculatedRates } from './use-calculated-rates';
import { defineMessage } from 'react-intl';

interface CalculatedRatesTableProps {
  selectedToken: string;
  selectedMarketKey: string | null;
  tradeAction: NOTIONAL_CATEGORIES;
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
    <DataTable
      data={tableData}
      columns={tableColumns}
      tableTitle={defineMessage({
        defaultMessage: 'Calculated Interest Rates',
        description: 'Calculated Interest Rates Table Title',
      })}
    />
  );
};
