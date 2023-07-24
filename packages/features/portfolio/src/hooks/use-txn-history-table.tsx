import {
  MultiValueIconCell,
  TxnHashCell,
  DataTableColumn,
} from '@notional-finance/mui';
// import { formatMaturity, getEtherscanLink } from '@notional-finance/helpers';
import { getEtherscanLink } from '@notional-finance/helpers';
import {
  useSelectedNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

export const useTxnHistoryTable = (currencyOptions: string[]) => {
  const accountHistory = useTransactionHistory();
  const selectedNetwork = useSelectedNetwork();

  const txnHistoryColumns: DataTableColumn[] = [
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
          defaultMessage="Underlying Amount"
          description={'Underlying Amount header'}
        />
      ),
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

  console.log({ accountHistory });

  const initialData = accountHistory
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
      }) => {
        return {
          transactionType: {
            label: bundleName,
            symbol: underlying.symbol.toLowerCase(),
          },
          underlyingAmount: underlyingAmountRealized.toDisplayStringWithSymbol(
            3,
            true
          ),
          assetAmount: tokenAmount.toDisplayString(3, true),
          asset: {
            label: 'test',
            symbol: token.symbol,
          },
          price: realizedPrice.toFloat(),
          time: `${moment(timestamp).format('hh:mm A')}, ${moment(
            timestamp
          ).format('MM/DD/YY')}`,
          txLink: {
            hash: transactionHash,
            href: getEtherscanLink(transactionHash, selectedNetwork),
          },
        };
      }
    );

  const filterTxnHistoryData = () => {
    // const filterData = [...currencyOptions, ...productOptions];

    const filterData = [...currencyOptions];

    if (filterData.length === 0) return initialData;

    // if (productOptions.length > 0 && currencyOptions.length > 0) {
    //   return initialData
    //     .filter(({ currency }) => filterData.includes(currency))
    //     .filter(({ product }) => filterData.includes(product));
    // }
    // if (currencyOptions.length > 0) {
    //   return initialData.filter(({ currency }) =>
    //     currencyOptions.includes(currency)
    //   );
    // }
    // if (productOptions.length > 0) {
    //   return initialData.filter(({ product }) =>
    //     productOptions.includes(product)
    //   );
    // }
  };

  const txnHistoryData = filterTxnHistoryData();

  return { txnHistoryData, txnHistoryColumns };
};
