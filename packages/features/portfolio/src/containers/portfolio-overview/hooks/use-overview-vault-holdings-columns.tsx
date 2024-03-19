import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useOverviewVaultHoldingsColumns = () => {
  const overviewVaultHoldingsColumns: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage defaultMessage="Vault" description={'vault header'} />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'strategy',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Net Worth"
          description={'Net Worth header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'netWorth',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Assets"
          description={'assets header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'assets',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Debts" description={'Debts header'} />
      ),
      cell: MultiValueCell,
      accessorKey: 'debts',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="APY" description={'Debts header'} />
      ),
      accessorKey: 'totalAPY',
      textAlign: 'right',
    },
  ];

  return {
    overviewVaultHoldingsColumns,
  };
};
