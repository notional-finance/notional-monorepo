import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useOverviewVaultHoldingsColumns = () => {
  const overviewVaultHoldingsColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage defaultMessage="Vault" description={'vault header'} />
      ),
      Cell: MultiValueIconCell,
      accessor: 'strategy',
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
        <FormattedMessage defaultMessage="APY" description={'Debts header'} />
      ),
      accessor: 'totalAPY',
      textAlign: 'right',
    },
  ];

  return {
    overviewVaultHoldingsColumns,
  };
};
