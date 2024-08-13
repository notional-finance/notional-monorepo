import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatNumber,
} from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import {
  useAllMarkets,
  useFiat,
  useAccountDefinition,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  getDebtOrCollateralFactor,
  getIncentiveData,
  getCombinedIncentiveData,
} from './utils';
import {
  DisplayCell,
  LinkCell,
  DataTableColumn,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useMaxYield } from '@notional-finance/trade';
import { YieldData } from '@notional-finance/core-entities';

export const useLiquidityList = (
  product: PRODUCTS,
  network: Network | undefined
) => {
  const {
    yields: { liquidity },
  } = useAllMarkets(network);
  const allMaxAPYs = useMaxYield(network);
  const baseCurrency = useFiat();
  const account = useAccountDefinition(network);
  let yieldData = liquidity as YieldData[];

  if (product === PRODUCTS.LIQUIDITY_LEVERAGED) {
    yieldData = allMaxAPYs;
  }

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
      sortingFn: 'basic',
      enableSorting: true,
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      cell: MultiValueIconCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'totalApy',
      sortingFn: 'basic',
      enableSorting: true,
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Organic APY"
          description={'Organic header'}
        />
      ),
      cell: MultiValueIconCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'organicApy',
      sortingFn: 'basic',
      enableSorting: true,
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="INCENTIVE APY"
          description={'INCENTIVE APY header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'incentiveApy',
      textAlign: 'right',
      sortingFn: 'basic',
      enableSorting: true,
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
      // Update this to use baseCurrency
      displayFormatter: (value: number) =>
        formatNumberAsAbbr(value, 0, baseCurrency),
      accessorKey: 'liquidity',
      textAlign: 'right',
      sortingFn: 'basic',
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Borrow Terms"
          description={'Borrow Terms header'}
        />
      ),
      cell: MultiValueIconCell,
      sortingFn: 'basic',
      enableSorting: true,
      accessorKey: 'borrowTerms',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Collateral Factor"
          description={'Collateral Factor header'}
        />
      ),
      columnHeaderToolTip: defineMessage({
        defaultMessage:
          'Max LTV = (Collateral factor of collateral currency) / (Debt factor of debt currency)',
      }),
      accessorKey: 'collateralFactor',
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

  if (account === undefined) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'walletBalance');
  }

  if (product === PRODUCTS.LIQUIDITY_LEVERAGED) {
    listColumns = listColumns.filter(
      (x) =>
        x.accessorKey !== 'collateralFactor' && x.accessorKey !== 'liquidity'
    );
  }

  if (product === PRODUCTS.LIQUIDITY_VARIABLE) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'borrowTerms');
  }

  const listData = yieldData
    .map((y) => {
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === y.underlying.id)
        : undefined;
      const organicApy = (y.organicAPY || 0) + (y.feeAPY || 0);

      return {
        currency: {
          symbol: y.underlying.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: y.underlying.symbol,
          caption: network ? network.charAt(0).toUpperCase() + network.slice(1) : '',
        },
        walletBalance: walletBalance?.toFloat() || 0,
        totalApy: y.totalAPY || 0,
        organicApy,
        incentiveApy: getCombinedIncentiveData(
          y.noteIncentives,
          y.secondaryIncentives
        ),
        liquidity: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        collateralFactor: getDebtOrCollateralFactor(
          y.token,
          y.underlying,
          false
        ),
        view:
          product === PRODUCTS.LIQUIDITY_VARIABLE
            ? `${product}/${network}/${y.underlying.symbol}`
            : `${product}/${network}/CreateLeveragedNToken/${y.underlying.symbol}?borrowOption=${y?.leveraged?.debtToken?.id}`,
        symbol: y.underlying.symbol,
        borrowTerms: y?.leveraged?.debtToken?.maturity
          ? y?.leveraged?.debtToken?.maturity
          : 0,
        multiValueCellData: {
          currency: {
            symbol: y.underlying.symbol,
            symbolSize: 'large',
            symbolBottom: '',
            label: y.underlying.symbol,
            caption: network ? network.charAt(0).toUpperCase() + network.slice(1) : '',
            network: network,
          },
          totalApy: {
            label: formatNumberAsPercent(y.totalAPY, 2),
            caption: y?.leveraged?.leverageRatio
              ? `${formatNumber(y?.leveraged?.leverageRatio, 1)}x Leverage`
              : undefined,
          },
          organicApy: {
            symbol: y.underlying.symbol,
            label: organicApy,
            labelIsNegative: organicApy && organicApy < 0 ? true : false,
          },
          incentiveApy: getIncentiveData(
            y.noteIncentives,
            y.secondaryIncentives
          ),
          borrowTerms: {
            label:
              y?.leveraged?.debtToken.tokenType === 'fCash'
                ? 'Fixed'
                : 'Variable',
            caption: y?.leveraged?.debtToken?.maturity
              ? formatMaturity(y?.leveraged?.debtToken?.maturity)
              : undefined,
          },
        },
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
