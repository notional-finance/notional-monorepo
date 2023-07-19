import {
  IconCell,
  TxnHashCell,
  NegativeValueCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { formatMaturity, getEtherscanLink } from '@notional-finance/helpers';
import {
  useSelectedNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

export const useTransactionHistoryTable = () => {
  const accountHistory = useTransactionHistory();
  const selectedNetwork = useSelectedNetwork();

  const txnHistoryColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      accessor: 'currency',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Action"
          description={'Action header'}
        />
      ),
      accessor: 'action',
      textAlign: 'left',
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
          defaultMessage="Transaction Hash"
          description={'Transaction Hash header'}
        />
      ),
      accessor: 'transactionHash',
      Cell: TxnHashCell,
      showLinkIcon: true,
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Amount"
          description={'Amount header'}
        />
      ),
      Cell: NegativeValueCell,
      accessor: 'amount',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'Maturity header'}
        />
      ),
      accessor: 'maturity',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Rate" description={'Rate header'} />
      ),
      accessor: 'rate',
      textAlign: 'right',
    },
  ];

  const txnHistoryData = accountHistory
    .sort((x, y) => y.timestamp - x.timestamp)
    .map((data) => {
      return {
        currency: data.underlying.symbol,
        action: data.bundleName,
        time: `${moment(data.timestamp).format('hh:mm A')}, ${moment(
          data.timestamp
        ).format('MM/DD/YY')}`,
        transactionHash: {
          hash: data.transactionHash,
          href: getEtherscanLink(data.transactionHash, selectedNetwork),
        },
        maturity: data?.token.maturity
          ? formatMaturity(data?.token.maturity)
          : '-',
        amount: {
          displayValue: data.tokenAmount.toDisplayStringWithSymbol(3),
          isNegative: data.tokenAmount.isNegative(),
        },
        rate: '-',
      };
    });

  return { txnHistoryData, txnHistoryColumns };
};
