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
  } = useAllMarkets(Network.ArbitrumOne);
  const listedVaults = useAllVaults(network);
  const baseCurrency = useFiat();
  const account = useAccountDefinition(network);

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
        <FormattedMessage defaultMessage="Pool" description={'Pool header'} />
      ),
      accessor: 'pool',
      textAlign: 'right',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Protocols"
          description={'Protocols header'}
        />
      ),
      accessor: 'protocols',
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
    // TODO: Add incentive APY back in when we need it
    // {
    //   Header: (
    //     <FormattedMessage
    //       defaultMessage="INCENTIVE APY"
    //       description={'INCENTIVE APY header'}
    //     />
    //   ),
    //   Cell: MultiValueIconCell,
    //   accessor: 'incentiveApy',
    //   textAlign: 'right',
    //   sortType: 'basic',
    //   sortDescFirst: true,
    // },
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
      Header: (
        <FormattedMessage
          defaultMessage="Borrow Terms"
          description={'Borrow Terms header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'borrowTerms',
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

  const listData = listedVaults
    .map((y) => {
      const x = getMax(
        leveragedVaults.filter((z) => z.token.vaultAddress === y.vaultAddress)
      );
      const maxBalance = account
        ? account.balances.find(
            (t) => t.underlying.symbol === y.primaryToken.symbol
          )
        : undefined;

      return {
        currency: {
          symbol: y.primaryToken.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: y.primaryToken.symbol,
          caption: network.charAt(0).toUpperCase() + network.slice(1),
        },
        walletBalance: maxBalance?.toFloat() || 0,
        pool: y.poolName,
        protocols: `${y.boosterProtocol} / ${y.baseProtocol}`,
        totalApy: x?.totalAPY || 0,
        // TODO: Add incentive APY back in when we need it
        // incentiveApy: getCombinedIncentiveData(
        //   y.noteIncentives,
        //   y.secondaryIncentives
        // ),
        liquidity: y.vaultTVL ? y.vaultTVL.toFiat(baseCurrency).toFloat() : 0,
        view: `/${PRODUCTS.VAULTS}/${network}/${y.vaultAddress}`,
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
