import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatNumber,
} from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import {
  useAllMarkets,
  useFiat,
  useAllVaults,
  useAccountDefinition,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';

export const useVaultList = (network: Network) => {
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(network);
  const listedVaults = useAllVaults(network);
  const baseCurrency = useFiat();
  const account = useAccountDefinition(network);
  const vaultHoldings = useVaultHoldings(network);

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
        <FormattedMessage defaultMessage="Pool" description={'Pool header'} />
      ),
      accessorKey: 'pool',
      textAlign: 'right',
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Protocols"
          description={'Protocols header'}
        />
      ),
      accessorKey: 'protocols',
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
    // TODO: Add incentive APY back in when we need it
    // {
    //   header: (
    //     <FormattedMessage
    //       defaultMessage="INCENTIVE APY"
    //       description={'INCENTIVE APY header'}
    //     />
    //   ),
    //   cell: MultiValueIconCell,
    //   accessorKey: 'incentiveApy',
    //   textAlign: 'right',
    //   sortType: 'basic',
    //   sortDescFirst: true,
    // },
    {
      header: (
        <FormattedMessage defaultMessage="TVL" description={'TVL header'} />
      ),
      cell: DisplayCell,
      displayFormatter: (value: number) =>
        formatNumberAsAbbr(value, 0, baseCurrency),
      accessorKey: 'tvl',
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
      cell: MultiValueCell,
      accessorKey: 'borrowTerms',
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

  const listData = listedVaults
    .map((y) => {
      const x = getMax(
        leveragedVaults.filter((z) => z.token.vaultAddress === y.vaultAddress)
      );
      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === y.primaryToken.id)
        : undefined;
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === y.vaultAddress
      )?.vault;

      return {
        currency: {
          symbol: y.primaryToken.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: y.primaryToken.symbol,
          caption: network.charAt(0).toUpperCase() + network.slice(1),
        },
        walletBalance: walletBalance?.toFloat() || 0,
        pool: y.poolName,
        protocols: `${y.boosterProtocol} / ${y.baseProtocol}`,
        totalApy: x?.totalAPY || 0,
        // TODO: Add incentive APY back in when we need it
        // incentiveApy: getCombinedIncentiveData(
        //   y.noteIncentives,
        //   y.secondaryIncentives
        // ),
        tvl: y.vaultTVL ? y.vaultTVL.toFiat(baseCurrency).toFloat() : 0,
        view: profile
          ? `${PRODUCTS.VAULTS}/${network}/${y.vaultAddress}/IncreaseVaultPosition`
          : `${PRODUCTS.VAULTS}/${network}/${y.vaultAddress}/CreateVaultPosition?borrowOption=${x?.leveraged?.vaultDebt?.id}`,
        symbol: y.primaryToken.symbol,
        borrowTerms: {
          data: [
            {
              displayValue:
                x?.leveraged?.debtToken.tokenType === 'fCash'
                  ? 'Fixed'
                  : 'Variable',
              isNegtive: false,
            },
            {
              displayValue: x?.leveraged?.debtToken?.maturity
                ? formatMaturity(x?.leveraged?.debtToken?.maturity)
                : '',
              isNegtive: false,
            },
          ],
        },
        multiValueCellData: {
          currency: {
            symbol: y.primaryToken.symbol,
            symbolSize: 'large',
            symbolBottom: '',
            label: y.primaryToken.symbol,
            caption: network.charAt(0).toUpperCase() + network.slice(1),
            network: network,
          },
          totalApy: {
            label: x?.totalAPY
              ? formatNumberAsPercent(x.totalAPY, 2)
              : undefined,
            labelIsNegative: x?.totalAPY && x?.totalAPY < 0 ? true : false,
            caption: x?.leveraged?.leverageRatio
              ? `${formatNumber(x?.leveraged?.leverageRatio, 1)}x Leverage`
              : undefined,
          },
          // TODO: Add incentive APY back in when we need it
          //   incentiveApy: getIncentiveData(
          //     y.noteIncentives,
          //     y.secondaryIncentives
          //   ),
        },
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
