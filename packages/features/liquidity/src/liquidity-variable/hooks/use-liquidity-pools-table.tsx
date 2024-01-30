import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  TxnHashCell,
} from '@notional-finance/mui';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { LiquidityContext } from '../../liquidity';
import {
  formatMaturity,
  getEtherscanTransactionLink,
} from '@notional-finance/util';
import moment from 'moment';

export const useLiquidityPoolsTable = () => {
  const {
    state: { deposit, selectedNetwork },
  } = useContext(LiquidityContext);
  const {
    globalState: { historicalTrading },
  } = useNotionalContext();
  let poolTableData: Record<string, any>[] = [];

  if (
    deposit &&
    deposit?.currencyId &&
    selectedNetwork &&
    historicalTrading &&
    historicalTrading[selectedNetwork]
  ) {
    poolTableData = historicalTrading[selectedNetwork][deposit?.currencyId]
      .slice(0, 25)
      .map(
        ({
          bundleName,
          interestRate,
          underlyingTokenBalance,
          timestamp,
          transactionHash,
          fCashMaturity,
        }) => {
          let action = '';
          if (bundleName.includes('Buy')) {
            action = bundleName.includes('Vault') ? 'Lend (Vault)' : 'Lend';
          } else {
            action = bundleName.includes('Vault') ? 'Borrow (Vault)' : 'Borrow';
          }
          const date = new Date(timestamp * 1000);

          return {
            action: {
              data: [
                { displayValue: action, isNegtive: false },
                {
                  displayValue: fCashMaturity
                    ? formatMaturity(fCashMaturity)
                    : '',
                  isNegtive: false,
                },
              ],
            },
            details: {
              symbol: underlyingTokenBalance?.symbol,
              label: underlyingTokenBalance?.toDisplayString(),
            },
            interestRate: interestRate,
            time: moment(date).fromNow(),
            txn: {
              href: getEtherscanTransactionLink(
                transactionHash,
                selectedNetwork
              ),
            },
          };
        }
      );
  }

  const poolTableColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Action"
          description={'action header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'action',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Details"
          description={'details header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'details',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Interest Rate"
          description={'interest rate header'}
        />
      ),
      accessor: 'interestRate',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="Time" description={'time header'} />
      ),
      width: '250px',
      accessor: 'time',
      textAlign: 'right',
    },
    {
      Header: '',
      accessor: 'txn',
      Cell: TxnHashCell,
      width: '50px',
      showLinkIcon: true,
      textAlign: 'right',
    },
  ];

  return { poolTableColumns, poolTableData };
};
