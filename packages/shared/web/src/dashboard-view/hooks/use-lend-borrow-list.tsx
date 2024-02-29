import {
  formatNumber,
  formatNumberAsAbbr,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  useAllMarkets,
  useFiat,
  useAccountDefinition,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS, getDateString } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { getDebtOrCollateralFactor } from './utils';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  MultiValueIconCell,
} from '@notional-finance/mui';

export const useLendBorrowList = (product: PRODUCTS, network: Network) => {
  const {
    yields: { fCashLend, fCashBorrow, variableBorrow, variableLend },
  } = useAllMarkets(network);
  const baseCurrency = useFiat();
  const account = useAccountDefinition(network);
  const isBorrow =
    product === PRODUCTS.BORROW_FIXED || product === PRODUCTS.BORROW_VARIABLE;

  const yieldData = {
    [PRODUCTS.LEND_FIXED]: fCashLend,
    [PRODUCTS.LEND_VARIABLE]: variableLend,
    [PRODUCTS.BORROW_FIXED]: fCashBorrow,
    [PRODUCTS.BORROW_VARIABLE]: variableBorrow,
  };

  let listColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'currency',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Wallet Balance"
          description={'Wallet Balance header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: (val, symbol) => {
        return `${formatNumber(val, 2)} ${symbol}`;
      },
      showSymbol: true,
      accessor: 'walletBalance',
      sortType: 'basic',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'Maturity header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: getDateString,
      accessor: 'maturity',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage defaultMessage="APY" description={'APY header'} />
      ),
      displayFormatter: formatNumberAsPercent,
      Cell: DisplayCell,
      accessor: 'apy',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Liquidity"
          description={'Liquidity header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: formatNumberAsAbbr,
      accessor: 'liquidity',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      Header: isBorrow ? (
        <FormattedMessage
          defaultMessage="Debt Factor"
          description={'Collateral Factor header'}
        />
      ) : (
        <FormattedMessage
          defaultMessage="Collateral Factor"
          description={'Collateral Factor header'}
        />
      ),
      accessor: 'collateralFactor',
      columnHeaderToolTip: defineMessage({
        defaultMessage:
          'Max LTV = (Collateral factor of collateral currency) / (Debt factor of debt currency)',
      }),
      textAlign: 'right',
    },
    {
      Header: '',
      Cell: LinkCell,
      accessor: 'view',
      textAlign: 'right',
      width: '70px',
    },
  ];

  if (isBorrow) {
    listColumns = listColumns.filter((x) => x.accessor !== 'walletBalance');
  }

  if (
    product === PRODUCTS.LEND_VARIABLE ||
    product === PRODUCTS.BORROW_VARIABLE
  ) {
    listColumns = listColumns.filter((x) => x.accessor !== 'maturity');
  }

  if (account === undefined) {
    listColumns = listColumns.filter((x) => x.accessor !== 'walletBalance');
  }

  const listData = yieldData[product]
    .map((y) => {
      const maxBalance = account
        ? account.balances.find(
            (t) => t.underlying.symbol === y.underlying.symbol
          )
        : undefined;
      return {
        currency: {
          symbol: y.underlying.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: y.underlying.symbol,
          caption: network.charAt(0).toUpperCase() + network.slice(1),
        },
        walletBalance: maxBalance?.toFloat() || 0,
        maturity: y.token.maturity,
        apy: y.totalAPY,
        liquidity: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        symbol: y.underlying.symbol,
        collateralFactor: getDebtOrCollateralFactor(
          y.token,
          y.underlying,
          isBorrow
        ),
        view: `${product}/${network}/${y.underlying.symbol}`,
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
