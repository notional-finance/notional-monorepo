import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  DataTableColumn,
  MultiValueIconCell,
  MultiValueCell,
} from '@notional-finance/mui';
import {
  useAllMarkets,
  useBalanceStatements,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export function usePortfolioHoldings() {
  const balanceStatements = useBalanceStatements();
  const { allYields } = useAllMarkets();

  const portfolioHoldingsColumns: DataTableColumn[] = [
    {
      Header: <FormattedMessage defaultMessage="Asset" />,
      Cell: MultiValueIconCell,
      accessor: 'asset',
      textAlign: 'left',
    },
    {
      Header: <FormattedMessage defaultMessage="Market APY" />,
      accessor: 'marketApy',
      textAlign: 'right',
    },
    {
      Header: <FormattedMessage defaultMessage="Cost Basis" />,
      Cell: MultiValueCell,
      accessor: 'costBasis',
      textAlign: 'right',
    },
    {
      Header: <FormattedMessage defaultMessage="Present Value" />,
      Cell: MultiValueCell,
      accessor: 'presentValue',
      textAlign: 'right',
    },
    {
      Header: <FormattedMessage defaultMessage="Earnings" />,
      Cell: MultiValueCell,
      accessor: 'earnings',
      textAlign: 'right',
    },
  ];

  const portfolioHoldingsData =
    balanceStatements
      .filter(
        (b) =>
          !b.currentBalance.isVaultToken &&
          b.token.tokenType !== 'Underlying' &&
          b.token.tokenType !== 'NOTE'
      )
      .map((b) => {
        return {
          asset: {
            symbol: b.underlying.symbol,
            label: b.token.symbol,
            caption:
              b.token.tokenType === 'fCash' ? '?? APY at Maturity' : undefined,
          },
          // TODO: this has a caption for note incentives
          marketApy: formatNumberAsPercent(
            allYields.find(
              (y) => y.token.id === b.token.id && y.leveraged === undefined
            )?.totalAPY || 0
          ),
          costBasis: formatCryptoWithFiat(b.accumulatedCostRealized),
          presentValue: formatCryptoWithFiat(b.currentBalance.toUnderlying()),
          earnings: formatCryptoWithFiat(b.totalProfitAndLoss),
        };
      }) || [];

  return { portfolioHoldingsColumns, portfolioHoldingsData };
}
