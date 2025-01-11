import { formatNumberAsPercent, formatNumber } from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import {
  useAccountDefinition,
  useGroupedHoldings,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { getIncentiveData, sumAndFormatIncentives } from './utils';
import {
  DisplayCell,
  LinkCell,
  DataTableColumn,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { useCurrentNetworkStore } from '@notional-finance/notionable-hooks';
import { ProductAPY } from '@notional-finance/core-entities';

export const useLiquidityLeveragedList = (network: Network | undefined) => {
  const account = useAccountDefinition(network);
  const currentNetworkStore = useCurrentNetworkStore();
  const groupedHoldings = useGroupedHoldings(network);
  const nTokenPositions = groupedHoldings?.filter(
    ({ asset }) => asset.balance.tokenType === 'nToken'
  );

  const yieldData: ProductAPY[] =
    currentNetworkStore.getAllLeveragedNTokenYields();

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

  const listData = yieldData
    .map((y) => {
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === y?.underlying?.id)
        : undefined;
      const currentPosition = nTokenPositions?.find(
        (n) => n.asset.balance.underlying.symbol === y?.underlying?.symbol
      );
      const totalApy = currentPosition
        ? currentPosition.totalLeveragedApy || 0
        : y.apy.totalAPY || 0;
      const organicApy = currentPosition
        ? currentPosition.totalLeveragedApy || 0 - totalApy
        : y.apy.organicAPY || 0;
      const incentiveApy = currentPosition
        ? formatNumberAsPercent(currentPosition.totalIncentiveAPY || 0)
        : y.apy.incentives && y.apy?.incentives?.length > 0
        ? sumAndFormatIncentives(y.apy.incentives)
        : '';
      const debtToken = currentPosition
        ? currentPosition.debt.balance.token
        : y?.debtToken;
      const leverageRatio = currentPosition
        ? currentPosition.leverageRatio
        : y.apy.leverageRatio;

      return {
        currency: {
          symbol: y?.underlying?.symbol || '',
          symbolSize: 'large',
          symbolBottom: '',
          label: y?.underlying?.symbol || '',
          caption: network
            ? network.charAt(0).toUpperCase() + network.slice(1)
            : '',
        },
        walletBalance: walletBalance?.toFloat() || 0,
        totalApy,
        organicApy,
        incentiveApy,
        view: currentPosition
          ? `${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/IncreaseLeveragedNToken/${y.underlying?.symbol}`
          : `${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/CreateLeveragedNToken/${y.underlying?.symbol}?borrowOption=${debtToken?.id}`,
        symbol: y?.underlying?.symbol || '',
        borrowTerms: debtToken?.maturity ? debtToken?.maturity : 0,
        multiValueCellData: {
          currency: {
            symbol: y?.underlying?.symbol || '',
            symbolSize: 'large',
            symbolBottom: '',
            label: y?.underlying?.symbol || '',
            caption: network
              ? network.charAt(0).toUpperCase() + network.slice(1)
              : '',
            network: network,
          },
          totalApy: {
            label: formatNumberAsPercent(totalApy, 2),
            caption: leverageRatio
              ? `${formatNumber(leverageRatio, 1)}x Leverage`
              : undefined,
          },
          organicApy: {
            symbol: y?.underlying?.symbol || '',
            label: organicApy,
            labelIsNegative: organicApy && organicApy < 0 ? true : false,
          },
          incentiveApy:
            y?.apy?.incentives && y?.apy?.incentives?.length > 0
              ? getIncentiveData(y?.apy?.incentives)
              : '',
          borrowTerms: {
            label: debtToken?.tokenType === 'fCash' ? 'Fixed' : 'Variable',
            caption: debtToken?.maturity
              ? formatMaturity(debtToken?.maturity)
              : undefined,
          },
        },
      };
    })
    .sort((a, b) => b?.walletBalance - a?.walletBalance);

  return { listColumns, listData };
};
