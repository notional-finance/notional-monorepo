import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  useCurrentLiquidationPrices,
  useFiat,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useRiskOverviewTable = () => {
  const { portfolioLiquidation, vaultLiquidation } =
    useCurrentLiquidationPrices();
  const baseCurrency = useFiat();

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

  const liquidationPrices = portfolioLiquidation
    .filter(({ isPriceRisk }) => isPriceRisk)
    .map(({ asset, currentPrice, current }) => {
      return {
        collateral: {
          symbol: asset.symbol,
          label: asset.symbol,
        },
        riskFactor: {
          data: [`${asset.symbol}/${baseCurrency}`, 'Chainlink Oracle Price'],
          isNegative: false,
        },
        currentPrice: currentPrice.toDisplayStringWithSymbol(3),
        liquidationPrice: current,
      };
    });

  const vaultLiquidationPrice = vaultLiquidation.flatMap(
    ({ vaultName, liquidationPrices }) => {
      return liquidationPrices.map(({ underlying, currentPrice, current }) => {
        return {
          collateral: {
            symbol: underlying.symbol,
            label: vaultName,
            caption: 'Leveraged Vault',
          },
          riskFactor: {
            data: [
              `Vault Shares/${underlying.symbol}`,
              'Chainlink Oracle Price',
            ],
            isNegative: false,
          },
          currentPrice: currentPrice.toDisplayStringWithSymbol(3),
          liquidationPrice: current,
        };
      });
    }
  );

  return {
    riskOverviewColumns,
    riskOverviewData: liquidationPrices.concat(vaultLiquidationPrice),
  };
};
