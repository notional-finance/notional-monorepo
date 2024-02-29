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
  DataTableColumn,
  DisplayCell,
  LinkCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useMaxYield } from '@notional-finance/trade';
import { YieldData } from '@notional-finance/core-entities';

export const useLiquidityList = (product: PRODUCTS, network: Network) => {
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
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      Cell: MultiValueIconCell,
      displayFormatter: formatNumberAsPercent,
      accessor: 'totalApy',
      sortType: 'basic',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Organic APY"
          description={'Organic header'}
        />
      ),
      Cell: MultiValueIconCell,
      displayFormatter: formatNumberAsPercent,
      accessor: 'organicApy',
      sortType: 'basic',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="INCENTIVE APY"
          description={'INCENTIVE APY header'}
        />
      ),
      Cell: MultiValueIconCell,
      accessor: 'incentiveApy',
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
      // Update this to use baseCurrency
      displayFormatter: formatNumberAsAbbr,
      accessor: 'liquidity',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Borrow Terms"
          description={'Borrow Terms header'}
        />
      ),
      Cell: MultiValueIconCell,
      sortType: 'basic',
      accessor: 'borrowTerms',
      sortDescFirst: true,
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Collateral Factor"
          description={'Collateral Factor header'}
        />
      ),
      columnHeaderToolTip: defineMessage({
        defaultMessage:
          'Max LTV = (Collateral factor of collateral currency) / (Debt factor of debt currency)',
      }),
      accessor: 'collateralFactor',
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

  if (account === undefined) {
    listColumns = listColumns.filter((x) => x.accessor !== 'walletBalance');
  }

  if (product === PRODUCTS.LIQUIDITY_LEVERAGED) {
    listColumns = listColumns.filter(
      (x) => x.accessor !== 'collateralFactor' && x.accessor !== 'liquidity'
    );
  }

  if (product === PRODUCTS.LIQUIDITY_VARIABLE) {
    listColumns = listColumns.filter((x) => x.accessor !== 'borrowTerms');
  }

  const listData = yieldData
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
        totalApy: y.totalAPY || 0,
        organicApy: y.organicAPY,
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
            : `${product}/${network}/CreateLeveragedNToken/${y.underlying.symbol}`,
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
            caption: network.charAt(0).toUpperCase() + network.slice(1),
          },
          totalApy: {
            label: formatNumberAsPercent(y.totalAPY, 2),
            caption: y?.leveraged?.leverageRatio
              ? `${formatNumber(y?.leveraged?.leverageRatio, 1)}x Leverage`
              : undefined,
          },
          organicApy: {
            symbol: y.underlying.symbol,
            label: y.organicAPY,
            labelIsNegative: y.organicAPY && y.organicAPY < 0 ? true : false,
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
