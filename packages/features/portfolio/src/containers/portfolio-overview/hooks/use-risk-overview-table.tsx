import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  useCurrentLiquidationPrices,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useRiskOverviewTable = () => {
  const network = useSelectedNetwork();
  const { exchangeRateRisk, vaultLiquidation } =
    useCurrentLiquidationPrices(network);

  const riskOverviewColumns: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage
          defaultMessage="Collateral"
          description={'column header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'collateral',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Risk Factor"
          description={'column header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'riskFactor',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Current Price"
          description={'column header'}
        />
      ),
      accessorKey: 'currentPrice',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Liquidation Price"
          description={'column header'}
        />
      ),
      accessorKey: 'liquidationPrice',
      textAlign: 'right',
    },
  ];

  const vaultLiquidationPrice = vaultLiquidation.flatMap(
    ({ liquidationPrices }) => liquidationPrices
  );

  return {
    riskOverviewColumns,
    riskOverviewData: exchangeRateRisk.concat(vaultLiquidationPrice),
  };
};
