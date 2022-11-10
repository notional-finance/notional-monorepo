import { Market } from '@notional-finance/sdk/src/system';
import { IconCell, TxnHashCell, NegativeValueCell, DataTableColumn } from '@notional-finance/mui';
import { formatMaturity, getEtherscanLink } from '@notional-finance/utils';
import { useNotional, useTransactionHistory } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

export const useTransactionHistoryTable = () => {
  const tradeHistory = useTransactionHistory();
  const { connectedChain } = useNotional();

  const txnHistoryColumns: DataTableColumn[] = [
    {
      Header: <FormattedMessage defaultMessage="Currency" description={'Currency header'} />,
      accessor: 'currency',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: <FormattedMessage defaultMessage="Action" description={'Action header'} />,
      accessor: 'action',
      textAlign: 'left',
    },
    {
      Header: <FormattedMessage defaultMessage="Time" description={'Time header'} />,
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
      Header: <FormattedMessage defaultMessage="Amount" description={'Amount header'} />,
      Cell: NegativeValueCell,
      accessor: 'amount',
      textAlign: 'right',
    },
    {
      Header: <FormattedMessage defaultMessage="Maturity" description={'Maturity header'} />,
      accessor: 'maturity',
      textAlign: 'right',
    },
    {
      Header: <FormattedMessage defaultMessage="Rate" description={'Rate header'} />,
      accessor: 'rate',
      textAlign: 'right',
    },
  ];

  const txnHistoryData = tradeHistory
    .sort((x, y) => y.timestampMS - x.timestampMS)
    .map((data) => {
      return {
        currency: data.amount.symbol,
        action: data.txnType,
        time: `${moment(data.timestampMS).format('hh:mm A')}, ${moment(data.timestampMS).format(
          'MM/DD/YY'
        )}`,
        transactionHash: {
          hash: data.transactionHash,
          href: getEtherscanLink(data.transactionHash, connectedChain),
        },
        maturity: data?.maturity ? formatMaturity(data?.maturity) : '-',
        amount:
          data.amount.symbol !== 'sNOTE'
            ? {
                displayValue: data.amount.toDisplayStringWithSymbol(3),
                isNegative: data.amount.isNegative(),
              }
            : '-',
        rate: data?.rate ? Market.formatInterestRate(data.rate) : '-',
      };
    });

  return { txnHistoryData, txnHistoryColumns };
};
