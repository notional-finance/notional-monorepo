import { useCallback } from 'react';
import {
  MultiValueIconCell,
  MultiValueCell,
  TxnHashCell,
  DataTableColumn,
  DateTimeCell,
  SelectedOptions,
} from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { TXN_HISTORY_TYPE, getDateString } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useTxnHistoryTable = (
  currencyOptions: SelectedOptions[],
  assetOrVaultOptions: SelectedOptions[],
  txnHistoryCategory: number,
  accountHistoryData: any[]
) => {
  const VaultNameCell = ({ cell: { value } }) => {
    const theme = useTheme();
    return (
      <Box sx={{ width: theme.spacing(19), textWrap: 'wrap' }}>{value}</Box>
    );
  };

  const tableColumns: DataTableColumn[] = [
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
    },
    {
      header: (
        <FormattedMessage defaultMessage="Asset" description={'Asset header'} />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Vault Name"
          description={'Vault Name header'}
        />
      ),
      cell: VaultNameCell,
      accessorKey: 'vaultName',
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
        <FormattedMessage defaultMessage="Price" description={'Price header'} />
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
  ];

  const txnHistoryColumns =
    txnHistoryCategory === 0
      ? tableColumns.filter(({ accessorKey }) => accessorKey !== 'vaultName')
      : tableColumns;

  const getIds = (options: SelectedOptions[]) => {
    return options.map(({ id }) => id);
  };

  const filterTxnHistoryData = () => {
    const currencyIds = getIds(currencyOptions);
    const assetOrVaultIds = getIds(assetOrVaultOptions);
    const filterData = [...currencyIds, ...assetOrVaultIds];

    if (filterData.length === 0) return accountHistoryData;

    if (assetOrVaultIds.length > 0 && currencyIds.length > 0) {
      return txnHistoryCategory === 0
        ? accountHistoryData
            .filter(({ currency }) => filterData.includes(currency))
            .filter(({ token }) => filterData.includes(token.id))
        : accountHistoryData
            .filter(({ currency }) => filterData.includes(currency))
            .filter(({ token }) => filterData.includes(token.vaultAddress));
    }
    if (currencyIds.length > 0) {
      return accountHistoryData.filter(({ currency }) =>
        currencyIds.includes(currency)
      );
    }
    if (assetOrVaultIds.length > 0 && txnHistoryCategory === 0) {
      return accountHistoryData.filter(({ token }) =>
        filterData.includes(token.id)
      );
    }
    if (assetOrVaultIds.length > 0 && txnHistoryCategory === 1) {
      return accountHistoryData.filter(({ token }) =>
        filterData.includes(token.vaultAddress)
      );
    }
    return accountHistoryData;
  };

  const marketDataCSVFormatter = useCallback((data: any[]) => {
    return data.map(
      ({
        transactionType,
        vaultName,
        underlyingAmount,
        asset,
        price,
        time,
        txLink,
      }) => {
        let result = {};
        result = {
          'Transaction Type': `${transactionType.label}`,
          'Underlying Amount':
            underlyingAmount.data && underlyingAmount.data[0].displayValue,
          Asset: asset.label,
          Price: price,
          Time: getDateString(time, { showTime: true, slashesFormat: true }),
          'TX Hash': txLink.hash,
        };
        vaultName && (result = { 'Vault Name': vaultName, ...result });
        return result;
      }
    );
  }, []);

  const txnHistoryData = filterTxnHistoryData();

  return {
    txnHistoryData,
    txnHistoryColumns,
    marketDataCSVFormatter,
  };
};
