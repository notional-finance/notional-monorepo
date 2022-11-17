import {
  IconCell,
  MultiValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { formatValueWithFiat } from '@notional-finance/helpers';
import {
  useTotalHoldings,
  useAccount,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const usePortfolioHoldingsTable = () => {
  const totalHoldings = useTotalHoldings();
  const { accountDataCopy, accountSummariesLoaded } = useAccount();

  const portfolioHoldingsColumns: DataTableColumn[] = [
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
    {
      Header: (
        <FormattedMessage
          defaultMessage="Unused Currency"
          description={'currency header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'unusedCurrency',
      textAlign: 'right',
    },
  ];

  const portfolioHoldingsData = Array.from(totalHoldings?.entries() || []).map(
    ([key, data]) => {
      const cashBalance = accountDataCopy.cashBalance(key)?.toUnderlying(true);
      const totalAssets = data.totalAssets;
      const totalDebts = data.totalDebts;

      return {
        currency: totalAssets.symbol,
        netWorth: formatValueWithFiat(totalAssets.sub(totalDebts)),
        assets: formatValueWithFiat(totalAssets),
        debts: formatValueWithFiat(totalDebts, true),
        unusedCurrency: formatValueWithFiat(cashBalance),
      };
    }
  );

  return {
    tableLoading: !accountSummariesLoaded,
    portfolioHoldingsColumns,
    portfolioHoldingsData,
  };
};
