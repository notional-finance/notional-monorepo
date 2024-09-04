import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatNumber,
} from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import {
  useAppStore,
  useAccountDefinition,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { sumAndFormatIncentives } from './utils';
import {
  DisplayCell,
  LinkCell,
  DataTableColumn,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useNetworkTokens } from './use-network-tokens';

export const useLiquidityList = (
  product: PRODUCTS,
  network: Network | undefined
) => {
  const { baseCurrency } = useAppStore();
  const account = useAccountDefinition(network);
  const yieldData = useNetworkTokens(network, 'nToken', {
    leveragedNToken: product === PRODUCTS.LIQUIDITY_LEVERAGED,
  });

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
    .map(({ apy, tvl, underlying, debtToken }) => {
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === underlying.id)
        : undefined;
      const organicApy = (apy.organicAPY || 0) + (apy.feeAPY || 0);

      return {
        currency: {
          symbol: underlying.symbol || '',
          symbolSize: 'large',
          symbolBottom: '',
          label: underlying.symbol || '',
          caption: network
            ? network.charAt(0).toUpperCase() + network.slice(1)
            : '',
        },
        walletBalance: walletBalance?.toFloat() || 0,
        totalApy: apy.totalAPY || 0,
        organicApy,
        incentiveValue:
          apy.incentives && apy?.incentives?.length > 0
            ? sumAndFormatIncentives(apy.incentives)
            : '',
        liquidity: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        collateralFactor: '',
        // collateralFactor: getDebtOrCollateralFactor(
        //   y.token,
        //   y.underlying,
        //   false
        // ),
        view:
          product === PRODUCTS.LIQUIDITY_VARIABLE
            ? `${product}/${network}/${underlying.symbol} || ''`
            : `${product}/${network}/CreateLeveragedNToken/${underlying.symbol}?borrowOption=${debtToken?.id}` ||
              '',
        symbol: underlying.symbol || '',
        borrowTerms: debtToken?.maturity ? debtToken?.maturity : 0,
        multiValueCellData: {
          currency: {
            symbol: underlying.symbol || '',
            symbolSize: 'large',
            symbolBottom: '',
            label: underlying.symbol || '',
            caption: network
              ? network.charAt(0).toUpperCase() + network.slice(1)
              : '',
            network: network,
          },
          totalApy: {
            label: formatNumberAsPercent(apy.totalAPY, 2),
            caption: apy?.leverageRatio
              ? `${formatNumber(apy?.leverageRatio, 1)}x Leverage`
              : undefined,
          },
          organicApy: {
            symbol: underlying.symbol || '',
            label: organicApy,
            labelIsNegative: organicApy && organicApy < 0 ? true : false,
          },
          incentiveValue:
            apy.incentives && apy?.incentives?.length > 0
              ? sumAndFormatIncentives(apy.incentives)
              : '',
          borrowTerms: {
            label: debtToken.tokenType === 'fCash' ? 'Fixed' : 'Variable',
            caption: debtToken?.maturity
              ? formatMaturity(debtToken?.maturity)
              : undefined,
          },
        },
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
