import {
  formatNumber,
  formatNumberAsAbbr,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  useAccountDefinition,
  useTotalArbPoints,
  useCurrentSeason,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS, getDateString } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  DisplayCell,
  LinkCell,
  DataTableColumn,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { getArbBoosts, getPointsAPY } from '@notional-finance/core-entities';
import { PointsIcon } from '@notional-finance/icons';
import {
  useAppStore,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';

export const useLendBorrowList = (
  product: PRODUCTS,
  network: Network | undefined
) => {
  const totalArbPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();
  const { baseCurrency } = useAppStore();
  const account = useAccountDefinition(network);
  const currentNetworkStore = useCurrentNetworkStore();

  let yieldData: any[] = [];
  switch (product) {
    case PRODUCTS.LEND_FIXED:
      yieldData = currentNetworkStore.getAllFCashYields();
      break;
    case PRODUCTS.LEND_VARIABLE:
      yieldData = currentNetworkStore.getAllFCashYields();
      break;
    case PRODUCTS.BORROW_FIXED:
      yieldData = currentNetworkStore.getAllFCashDebt();
      break;
    case PRODUCTS.BORROW_VARIABLE:
      yieldData = currentNetworkStore.getAllFCashDebt();
      break;
  }

  const isBorrow =
    product === PRODUCTS.BORROW_FIXED || product === PRODUCTS.BORROW_VARIABLE;

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
      enableSorting: true,
      sortingFn: 'basic',
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
        <FormattedMessage
          defaultMessage="Points Boost"
          description={'Points Boost header'}
        />
      ),
      cell: MultiValueIconCell,
      showPointsIcon: true,
      accessorKey: 'pointsBoost',
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
      enableSorting: true,
      sortingFn: 'basic',
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
      enableSorting: true,
      sortingFn: 'basic',
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

  const listData = yieldData
    .map(({ token, apy, tvl, underlying, collateralFactor }) => {
      const boostNum = getArbBoosts(token, isBorrow);
      const pointsAPY = getPointsAPY(
        boostNum,
        totalArbPoints[currentSeason.db_name],
        currentSeason.totalArb,
        currentSeason.startDate,
        currentSeason.endDate
      );
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === underlying?.id)
        : undefined;
      return {
        currency: {
          symbol: underlying?.symbol || '',
          symbolSize: 'large',
          symbolBottom: '',
          label: underlying?.symbol || '',
          network: network,
          caption: network
            ? network.charAt(0).toUpperCase() + network.slice(1)
            : '',
        },
        walletBalance: walletBalance?.toFloat() || 0,
        maturity: token.maturity,
        pointsBoost: {
          label: boostNum > 0 ? `${boostNum}x` : '-',
          caption:
            pointsAPY > 0 && pointsAPY !== Infinity
              ? `${formatNumberAsPercent(pointsAPY, 2)} APY`
              : '',
        },
        apy: apy.totalAPY || 0,
        liquidity: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        symbol: underlying?.symbol || '',
        collateralFactor: collateralFactor ? collateralFactor : '',
        view: `${product}/${network}/${underlying?.symbol}`,
        iconCellData: {
          icon: PointsIcon,
        },
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
