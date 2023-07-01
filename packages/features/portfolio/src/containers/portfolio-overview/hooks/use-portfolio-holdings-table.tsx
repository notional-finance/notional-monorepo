import {
  IconCell,
  MultiValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { formatValueWithFiat } from '@notional-finance/helpers';
import {
  useAccountReady,
  usePortfolioRiskProfile,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { Registry } from '@notional-finance/core-entities';

export const useTotalHoldingsTable = () => {
  const portfolio = usePortfolioRiskProfile();
  const network = useSelectedNetwork();
  const isAccountReady = useAccountReady();

  const totalHoldingsColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      Cell: IconCell,
      accessor: 'currency',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Net Worth"
          description={'Net Worth header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'netWorth',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Assets"
          description={'assets header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'assets',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Debts" description={'Debts header'} />
      ),
      Cell: MultiValueCell,
      accessor: 'debts',
      textAlign: 'right',
    },
  ];

  const tokens = Registry.getTokenRegistry();
  const isReady = network && isAccountReady;
  const totalHoldingsData = isReady
    ? portfolio.allCurrencyIds
        .map((currencyId) => {
          const underlying = tokens.getUnderlying(network, currencyId);
          const totalAssets = portfolio.totalCurrencyAssets(
            currencyId,
            underlying.symbol
          );
          const totalDebts = portfolio.totalCurrencyDebts(
            currencyId,
            underlying.symbol
          );

          return {
            currency: underlying.symbol,
            netWorth: formatValueWithFiat(totalAssets.sub(totalDebts)),
            assets: formatValueWithFiat(totalAssets),
            debts: formatValueWithFiat(totalDebts, true),
          };
        })
        .concat({
          currency: 'Total',
          netWorth: formatValueWithFiat(portfolio.netWorth()),
          assets: formatValueWithFiat(portfolio.totalAssets()),
          debts: formatValueWithFiat(portfolio.totalDebt()),
        })
    : [];

  return { totalHoldingsColumns, totalHoldingsData };
};
