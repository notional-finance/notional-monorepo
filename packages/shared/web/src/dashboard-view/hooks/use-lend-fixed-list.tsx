import {
  formatNumberAsAbbr,
  //   formatLeverageRatio,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  useAllMarkets,
  useFiat,
  useAccountDefinition,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS, getDateString } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  MultiValueIconCell,
  //   MultiValueIconCell,
} from '@notional-finance/mui';

export const useLendFixedList = (network: Network) => {
  const {
    yields: { fCashLend },
  } = useAllMarkets(network);
  const baseCurrency = useFiat();
  const account = useAccountDefinition(network);

  const listColumns: DataTableColumn[] = [
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
          defaultMessage="Collateral Factor"
          description={'Collateral Factor header'}
        />
      ),
      accessor: 'collateralFactor',
      textAlign: 'right',
    },
    // {
    //   Header: (
    //     <FormattedMessage
    //       defaultMessage="INCENTIVE APY"
    //       description={'INCENTIVE APY header'}
    //     />
    //   ),
    //   Cell: MultiValueIconCell,
    //   accessor: 'incentiveAPY',
    //   textAlign: 'right',
    //   sortType: 'basic',
    //   sortDescFirst: true,
    // },
    {
      Header: '',
      Cell: LinkCell,
      accessor: 'view',
      textAlign: 'right',
    },
  ];

  const listData = fCashLend
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
        walletBalance: `${maxBalance?.toFloat().toFixed(2)} ${
          y.underlying.symbol
        }`,
        maturity: y.token.maturity,
        apy: y.totalAPY,
        liquidity: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        // subTitle: `TVL: ${
        //   y.tvl
        //     ? formatNumberAsAbbr(
        //         y.tvl.toFiat(baseCurrency).toFloat(),
        //         0,
        //         baseCurrency
        //       )
        //     : 0
        // }`,
        collateralFactor: 0,
        view: `/${PRODUCTS.LEND_FIXED}/${network}/${y.underlying.symbol}`,
      };
    })
    .sort((a, b) => b.liquidity - a.liquidity);

  console.log({ listData });

  return { columns: listColumns, data: listData };
};
