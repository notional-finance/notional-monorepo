import {
  ChevronCell,
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
import { useEffect, useMemo, useState } from 'react';
import { ExpandedState } from '@tanstack/react-table';
import { TxnHistoryRow } from './txn-history-row';

export const PortfolioTransactionHistory = observer(() => {
  const { accountHistory, filterData, pendingTokenData } = useTxnHistoryData();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});

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
        cell: MultiValueIconCell,
        textAlign: 'left',
        expandableTable: true,
      },
      {
        header: (
          <FormattedMessage defaultMessage="Time" description={'Time header'} />
        ),
        cell: DateTimeCell,
        accessorKey: 'timestamp',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="TX LINK"
            description={'TX LINK header'}
          />
        ),
        accessorKey: 'transactionHash',
        cell: TxnHashCell,
        textAlign: 'right',
        showLinkIcon: true,
        expandableTable: true,
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Amount To/From Wallet"
            description={'Amount To/From Wallet header'}
          />
        ),
        cell: MultiValueCell,
        showGreenText: true,
        accessorKey: 'amountToFromWallet',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: '',
        cell: ChevronCell,
        accessorKey: 'chevron',
        textAlign: 'left',
        expandableTable: true,
      },
    ],
    []
  );

  useEffect(() => {
    const formattedExpandedRows = txnHistoryColumns.reduce(
      (accumulator, _value, index) => {
        return { ...accumulator, [index]: index === 0 ? true : false };
      },
      {}
    );

    if (
      expandedRows === null &&
      JSON.stringify(formattedExpandedRows) !== '{}'
    ) {
      setExpandedRows(formattedExpandedRows);
    }
  }, [expandedRows, setExpandedRows, txnHistoryColumns]);

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
        expandableTable={true}
        CustomRowComponent={TxnHistoryRow}
        setExpandedRows={setExpandedRows}
        initialState={{
          expanded: expandedRows,
          clickDisabled: false,
        }}
        // csvDataFormatter={marketDataCSVFormatter}
      />
    </Box>
  );
});

export default PortfolioTransactionHistory;
