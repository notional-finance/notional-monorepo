import { useCallback } from 'react';
import {
  MultiValueIconCell,
  MultiValueCell,
  TxnHashCell,
  DataTableColumn,
  DateTimeCell,
  DisplayCell,
} from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import {
  getEtherscanLink,
  formatTokenType,
  formatTokenAmount,
  getDateString,
  formatNumber,
} from '@notional-finance/helpers';
import {
  useSelectedNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTxnHistoryTable = (
  currencyOptions: string[],
  assetOrVaultOptions: string[],
  txnHistoryType: TXN_HISTORY_TYPE
) => {
  const accountHistory = useTransactionHistory();
  const selectedNetwork = useSelectedNetwork();

  const VaultNameCell = ({ cell: { value } }) => {
    const theme = useTheme();
    return (
      <Box sx={{ width: theme.spacing(19), textWrap: 'wrap' }}>{value}</Box>
    );
  };

  const tableColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Transaction Type"
          description={'Transaction Type header'}
        />
      ),
      accessor: 'transactionType',
      Cell: MultiValueIconCell,
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Vault Name"
          description={'Vault Name header'}
        />
      ),
      Cell: VaultNameCell,
      accessor: 'vaultName',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Underlying Amount"
          description={'Underlying Amount header'}
        />
      ),
      Cell: DisplayCell,
      accessor: 'underlyingAmount',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Asset Amount"
          description={'Asset Amount header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'assetAmount',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Asset"
          description={'Asset  header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'asset',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Price" description={'Price header'} />
      ),
      accessor: 'price',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Time" description={'Time header'} />
      ),
      Cell: DateTimeCell,
      accessor: 'time',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="TX LINK"
          description={'TX LINK header'}
        />
      ),
      accessor: 'txLink',
      Cell: TxnHashCell,
      textAlign: 'right',
      showLinkIcon: true,
    },
  ];

  const allAccountHistoryData = accountHistory
    .sort((x, y) => y.timestamp - x.timestamp)
    .map(
      ({
        bundleName,
        underlyingAmountRealized,
        tokenAmount,
        token,
        realizedPrice,
        timestamp,
        transactionHash,
        underlying,
        impliedFixedRate,
        vaultName,
      }) => {
        const assetData = formatTokenType(token);
        return {
          transactionType: {
            label: bundleName,
            symbol: underlying.symbol.toLowerCase(),
          },
          vaultName: vaultName,
          underlyingAmount: underlyingAmountRealized.toDisplayStringWithSymbol(
            3,
            true
          ),
          assetAmount: formatTokenAmount(tokenAmount, impliedFixedRate),
          asset: {
            label: assetData.title,
            symbol: assetData.title.toLowerCase(),
            caption: assetData.caption ? assetData.caption : '',
          },
          price: formatNumber(realizedPrice.toFloat(), 2),
          time: timestamp,
          txLink: {
            hash: transactionHash,
            href: getEtherscanLink(transactionHash, selectedNetwork),
          },
          currency: underlying.symbol,
        };
      }
    );

  const formatTxnHistoryData = () => {
    const porfolioHoldingsData = allAccountHistoryData.filter(
      ({ vaultName }) => !vaultName
    );

    const leveragedVaultsData = allAccountHistoryData.filter(
      ({ vaultName }) => vaultName
    );

    return txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
      ? porfolioHoldingsData
      : leveragedVaultsData;
  };

  const initialData = formatTxnHistoryData();

  const txnHistoryColumns =
    txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
      ? tableColumns.filter(({ accessor }) => accessor !== 'vaultName')
      : tableColumns;

  const filterTxnHistoryData = () => {
    const filterData = [...currencyOptions, ...assetOrVaultOptions];
    if (filterData.length === 0) return initialData;
    if (assetOrVaultOptions.length > 0 && currencyOptions.length > 0) {
      return txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
        ? initialData
            .filter(({ currency }) => filterData.includes(currency))
            .filter(({ asset }) => filterData.includes(asset?.label))
        : initialData
            .filter(({ currency }) => filterData.includes(currency))
            .filter(
              ({ vaultName }) => vaultName && filterData.includes(vaultName)
            );
    }
    if (currencyOptions.length > 0) {
      return initialData.filter(({ currency }) =>
        currencyOptions.includes(currency)
      );
    }

    if (
      assetOrVaultOptions.length > 0 &&
      txnHistoryType === TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
    ) {
      return initialData.filter(({ asset }) =>
        filterData.includes(asset?.label)
      );
    }
    if (
      assetOrVaultOptions.length > 0 &&
      txnHistoryType === TXN_HISTORY_TYPE.LEVERAGED_VAULT
    ) {
      return initialData.filter(
        ({ vaultName }) => vaultName && filterData.includes(vaultName)
      );
    }
  };

  const txnHistoryData = filterTxnHistoryData();

  const marketDataCSVFormatter = useCallback((data: any[]) => {
    return data.map(
      ({
        transactionType,
        vaultName,
        underlyingAmount,
        assetAmount,
        asset,
        price,
        time,
        txLink,
      }) => {
        let result = {};
        result = {
          'Transaction Type': `${
            transactionType.label
          } ${transactionType.symbol.toUpperCase()}`,
          'Underlying Amount': underlyingAmount,
          'Asset Amount': assetAmount.data[0],
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

  return { txnHistoryData, txnHistoryColumns, marketDataCSVFormatter };
};
