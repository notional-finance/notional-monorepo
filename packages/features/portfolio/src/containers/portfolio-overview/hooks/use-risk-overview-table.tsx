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
      Header: (
        <FormattedMessage
          defaultMessage="Collateral"
          description={'column header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'collateral',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Risk Factor"
          description={'column header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'riskFactor',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Current Price"
          description={'column header'}
        />
      ),
      accessor: 'currentPrice',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Liquidation Price"
          description={'column header'}
        />
      ),
      accessor: 'liquidationPrice',
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
