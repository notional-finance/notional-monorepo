import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  TxnHashCell,
} from '@notional-finance/mui';
import {
  useCurrentNetworkStore,
  useCurrentTradeContext,
  useFetchAnalyticsData,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import {
  formatMaturity,
  formatNumberAsPercent,
  getEtherscanTransactionLink,
  RATE_PRECISION,
} from '@notional-finance/util';
import moment from 'moment';
import { useTheme } from '@mui/material';
import { useObserver } from 'mobx-react-lite';
import { fCashMarket, TokenBalance } from '@notional-finance/core-entities';
import { BigNumber } from 'ethers';

export const useLiquidityPoolsTable = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const store = useCurrentNetworkStore();
  const { deposit } = trade?.selectedTokens ?? {};
  const selectedNetwork = trade?.selectedNetwork;
  const historicalTrading = useObserver(() =>
    selectedNetwork && deposit?.currencyId
      ? store.getHistoricalTrading(deposit.currencyId)
      : undefined
  );
  useFetchAnalyticsData(
    'historicalTrading',
    !!historicalTrading,
    selectedNetwork
  );

  const poolTableData = historicalTrading
    ?.slice(0, 25)
    .map(
      ({
        bundleName,
        fCashId,
        fCashValue,
        valueInUnderlying,
        timestamp,
        transactionHash,
        fCashMaturity,
      }) => {
        let action = '';
        if (bundleName === 'Mint nToken') {
          action = 'Provide Liquidity';
        } else if (bundleName === 'Redeem nToken') {
          action = 'Redeem Liquidity';
        } else if (bundleName.includes('Buy')) {
          action = bundleName.includes('Vault') ? 'Lend (Vault)' : 'Lend';
        } else {
          action = bundleName.includes('Vault') ? 'Borrow (Vault)' : 'Borrow';
        }
        const underlyingTokenBalance =
          deposit && selectedNetwork
            ? new TokenBalance(valueInUnderlying, deposit.id, selectedNetwork)
            : undefined;
        const fCash =
          selectedNetwork && fCashId
            ? new TokenBalance(
                BigNumber.from(fCashValue),
                fCashId,
                selectedNetwork
              )
            : undefined;
        const date = new Date(timestamp * 1000);
        const interestRate =
          underlyingTokenBalance && fCash
            ? fCashMarket.getImpliedInterestRate(
                underlyingTokenBalance,
                fCash,
                timestamp
              )
            : undefined;

        return {
          action: {
            data: [
              { displayValue: action, isNegative: false },
              {
                displayValue: fCashMaturity
                  ? formatMaturity(fCashMaturity)
                  : '',
                isNegative: false,
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
          interestRate: interestRate
            ? formatNumberAsPercent((100 * interestRate) / RATE_PRECISION)
            : '',
          time: moment(date).fromNow(),
          txn: {
            href: getEtherscanTransactionLink(transactionHash, selectedNetwork),
          },
        };
      }
    );

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
      width: theme.spacing(23.375),
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
      width: theme.spacing(23.375),
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
      width: theme.spacing(23.375),
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="Time" description={'time header'} />
      ),
      accessorKey: 'time',
      width: theme.spacing(23.375),
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

  return { poolTableColumns, poolTableData: poolTableData ?? [] };
};
