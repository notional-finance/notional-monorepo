import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  TxnHashCell,
} from '@notional-finance/mui';
import {
  useAnalyticsReady,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
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
  const isReady = useAnalyticsReady(selectedNetwork);
  const {
    globalState: { historicalTrading },
  } = useNotionalContext();
  let poolTableData: Record<string, any>[] = [];

  if (
    isReady &&
    deposit?.currencyId &&
    selectedNetwork &&
    historicalTrading &&
    historicalTrading[selectedNetwork][deposit.currencyId]
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
              label: underlyingTokenBalance?.toDisplayStringWithSymbol(
                4,
                true,
                false
              ),
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
      header: (
        <FormattedMessage
          defaultMessage="Action"
          description={'action header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'action',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Details"
          description={'details header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'details',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Interest Rate"
          description={'interest rate header'}
        />
      ),
      accessorKey: 'interestRate',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Time" description={'time header'} />
      ),
      width: '250px',
      accessorKey: 'time',
      textAlign: 'right',
    },
    {
      header: '',
      accessorKey: 'txn',
      cell: TxnHashCell,
      width: '50px',
      showLinkIcon: true,
      textAlign: 'right',
    },
  ];

  return { poolTableColumns, poolTableData };
};
