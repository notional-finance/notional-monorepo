import { TokenBalance } from '@notional-finance/core-entities';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  usePortfolioRiskProfile,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useRiskOverviewTable = () => {
  const portfolio = usePortfolioRiskProfile();
  const vaults = useVaultRiskProfiles();

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

  const liquidationPrices = portfolio
    .getAllLiquidationPrices({
      onlyUnderlyingDebt: true,
    })
    .filter(({ price }) => price !== null)
    .map(({ collateral, debt, price }) => {
      const currentPrice = TokenBalance.unit(collateral).toToken(debt);
      return {
        collateral: {
          symbol: collateral.symbol,
          label: collateral.symbol,
          caption: '??',
        },
        riskFactor: {
          data: [
            `${collateral.symbol}/${debt.symbol}`,
            'Chainlink Oracle Price',
          ],
          isNegative: false,
        },
        currentPrice: currentPrice?.toDisplayStringWithSymbol(4),
        liquidationPrice: price?.toDisplayStringWithSymbol(4),
      };
    });

  const vaultLiquidationPrice = vaults.flatMap((v) => {
    const symbol = v.defaultSymbol as string;
    const name = v.vaultConfig.name;
    return v
      .getAllLiquidationPrices({ onlyUnderlyingDebt: true })
      .filter(({ price }) => price !== null)
      .map(({ collateral, debt, price }) => {
        const currentPrice = TokenBalance.unit(collateral).toToken(debt);
        return {
          collateral: {
            symbol: symbol,
            label: name,
            caption: 'Leveraged Vault',
          },
          riskFactor: {
            data: [`${collateral.symbol}/${symbol}`, 'Chainlink Oracle Price'],
            isNegative: false,
          },
          currentPrice: `${currentPrice?.toDisplayStringWithSymbol(4)}`,
          liquidationPrice: `${price?.toDisplayString(4)}`,
        };
      });
  });

  return {
    riskOverviewColumns,
    riskOverviewData: liquidationPrices.concat(vaultLiquidationPrice),
  };
};
