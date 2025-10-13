import {
  DataTable,
  DataTableColumn,
  DateTimeCell,
  MultiValueCell,
  MultiValueIconCell,
  TxnHashCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useTxnHistoryData } from './use-txn-history-data';
import { Box } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { PortfolioPageHeader } from '../../components';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

export const PortfolioTransactionHistory = observer(() => {
  const { accountHistory, filterData, pendingTokenData } = useTxnHistoryData();

  const txnHistoryColumns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Transaction Type"
            description={'Transaction Type header'}
          />
        ),
        accessorKey: 'transactionType',
        showSentAndReceivedIcons: true,
        cell: MultiValueIconCell,
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Asset"
            description={'Asset header'}
          />
        ),
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Underlying Amount"
            description={'Underlying Amount header'}
          />
        ),
        cell: MultiValueCell,
        accessorKey: 'underlyingAmount',
        textAlign: 'right',
      },

      {
        header: (
          <FormattedMessage
            defaultMessage="Price"
            description={'Price header'}
          />
        ),
        accessorKey: 'price',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage defaultMessage="Time" description={'Time header'} />
        ),
        cell: DateTimeCell,
        accessorKey: 'time',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="TX LINK"
            description={'TX LINK header'}
          />
        ),
        accessorKey: 'txLink',
        cell: TxnHashCell,
        textAlign: 'right',
        showLinkIcon: true,
      },
    ],
    []
  );

  return (
    <Box>
      <PortfolioPageHeader
        category={PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}
      />
      <DataTable
        data={accountHistory || []}
        columns={txnHistoryColumns}
        filterBarData={filterData}
        pendingMessage={
          <FormattedMessage defaultMessage={'Calculating transaction'} />
        }
        pendingTokenData={pendingTokenData}
        // csvDataFormatter={marketDataCSVFormatter}
      />
    </Box>
  );
});

export default PortfolioTransactionHistory;
