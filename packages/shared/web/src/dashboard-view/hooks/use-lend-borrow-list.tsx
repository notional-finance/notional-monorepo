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
      header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'currency',
      textAlign: 'left',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Wallet Balance"
          description={'Wallet Balance header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: (val, symbol) => {
        return `${formatNumber(val, 4)} ${symbol}`;
      },
      showSymbol: true,
      accessorKey: 'walletBalance',
      sortType: 'basic',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Maturity"
          description={'Maturity header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: getDateString,
      accessorKey: 'maturity',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage defaultMessage="APY" description={'APY header'} />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'apy',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Liquidity"
          description={'Liquidity header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: (value: number) =>
        formatNumberAsAbbr(value, 0, baseCurrency),
      accessorKey: 'liquidity',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      header: isBorrow ? (
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
      accessorKey: 'collateralFactor',
      columnHeaderToolTip: defineMessage({
        defaultMessage:
          'Max LTV = (Collateral factor of collateral currency) / (Debt factor of debt currency)',
      }),
      textAlign: 'right',
    },
    {
      header: '',
      cell: LinkCell,
      accessorKey: 'view',
      textAlign: 'right',
      width: '70px',
    },
  ];

  if (isBorrow) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'walletBalance');
  }

  if (
    product === PRODUCTS.LEND_VARIABLE ||
    product === PRODUCTS.BORROW_VARIABLE
  ) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'maturity');
  }

  if (account === undefined) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'walletBalance');
  }

  const listData = yieldData[product]
    .map((y) => {
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === y.underlying.id)
        : undefined;
      return {
        currency: {
          symbol: y.underlying.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: y.underlying.symbol,
          network: network,
          caption: network.charAt(0).toUpperCase() + network.slice(1),
        },
        walletBalance: walletBalance?.toFloat() || 0,
        maturity: y.token.maturity,
        apy: y.totalAPY,
        liquidity: y.liquidity ? y.liquidity.toFiat(baseCurrency).toFloat() : 0,
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
