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
  RATE_PRECISION,
  formatMaturity,
  getEtherscanTransactionLink,
} from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import moment from 'moment';
import {
  Registry,
  TokenBalance,
  fCashMarket,
} from '@notional-finance/core-entities';

export const useLiquidityPoolsTable = () => {
  const {
    state: { deposit, selectedNetwork },
  } = useContext(LiquidityContext);
  const {
    globalState: { historicalTrading },
  } = useNotionalContext();
  let poolTableData: Record<string, any>[] = [];

  if (deposit && deposit?.currencyId && selectedNetwork && historicalTrading) {
    poolTableData = historicalTrading[selectedNetwork][deposit?.currencyId]
      .slice(0, 25)
      .map(
        ({
          bundleName,
          currencyId,
          fCashId,
          fCashValue,
          pCashInUnderlying,
          timestamp,
          transactionHash,
        }) => {
          const fCashTokenBalance = TokenBalance.fromID(
            fCashValue,
            fCashId,
            selectedNetwork
          );
          const token = Registry.getTokenRegistry().getUnderlying(
            selectedNetwork,
            currencyId
          );
          const underlyingTokenBalance = TokenBalance.from(
            pCashInUnderlying,
            token
          );
          const interestRate = fCashMarket.getImpliedInterestRate(
            underlyingTokenBalance,
            fCashTokenBalance,
            timestamp
          );
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
                  displayValue: formatMaturity(fCashTokenBalance.maturity),
                  isNegtive: false,
                },
              ],
            },
            details: {
              symbol: underlyingTokenBalance.symbol,
              label: underlyingTokenBalance.toDisplayString(),
            },
            interestRate: interestRate
              ? formatNumberAsPercent((interestRate * 100) / RATE_PRECISION)
              : formatNumberAsPercent(0),
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
