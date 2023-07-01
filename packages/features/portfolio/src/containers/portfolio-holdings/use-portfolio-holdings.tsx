import { formatCryptoWithFiat } from '@notional-finance/helpers';
import {
  DataTableColumn,
  MultiValueIconCell,
  MultiValueCell,
} from '@notional-finance/mui';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export function usePortfolioHoldings() {
  const { account } = useAccountDefinition();

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
    account?.balances
      .filter(
        (b) =>
          !b.isVaultToken &&
          b.tokenType !== 'Underlying' &&
          b.tokenType !== 'NOTE'
      )
      .map((b) => {
        // TODO: need to pass this through a txn history filter...
        return {
          asset: {
            symbol: b.underlying.symbol,
            label: b.token.symbol,
            caption: b.tokenType === 'fCash' ? '?? APY at Maturity' : undefined,
          },
          marketApy: '??',
          costBasis: formatCryptoWithFiat(b.toUnderlying().copy(0)),
          presentValue: formatCryptoWithFiat(b.toUnderlying()),
          earnings: formatCryptoWithFiat(b.toUnderlying().copy(0)),
        };
      }) || [];

  return { portfolioHoldingsColumns, portfolioHoldingsData };
}
