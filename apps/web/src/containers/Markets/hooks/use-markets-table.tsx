import { useTheme } from '@mui/material';
import { YieldData } from '@notional-finance/core-entities';
import {
  formatLeverageRatio,
  formatNumberAsAbbr,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  MultiValueIconCell,
  SelectedOptions,
} from '@notional-finance/mui';
import {
  useAllNetworkMarkets,
  useUserSettings,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import {
  PRIME_CASH_VAULT_MATURITY,
  getDateString,
} from '@notional-finance/util';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

export const useMarketsTable = (
  earnBorrowOption: number,
  allNetworksOption: number,
  currencyOptions: SelectedOptions[],
  productOptions: SelectedOptions[]
) => {
  const theme = useTheme();
  const { baseCurrency } = useUserSettings();
  const { earnYields, borrowYields } = useAllNetworkMarkets();

  let tableColumns: DataTableColumn[] = [
    {
      header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      cell: MultiValueIconCell,
      className: 'sticky-column',
      accessorKey: 'currency',
      textAlign: 'left',
      width: theme.spacing(18.75),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Product"
          description={'Product header'}
        />
      ),
      accessorKey: 'product',
      textAlign: 'left',
      width: theme.spacing(15.875),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'totalAPY',
      textAlign: 'left',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Liquidity"
          description={'Liquidity header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: (val) => formatNumberAsAbbr(val, 2, baseCurrency),
      accessorKey: 'totalTVL',
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Leverage"
          description={'Leverage header'}
        />
      ),
      cell: DisplayCell,
      displayFormatter: formatLeverageRatio,
      accessorKey: 'leverage',
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
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
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    // {
    //   header: (
    //     <FormattedMessage
    //       defaultMessage="INCENTIVE APY"
    //       description={'INCENTIVE APY header'}
    //     />
    //   ),
    //   cell: MultiValueIconCell,
    //   accessorKey: 'incentiveAPY',
    //   textAlign: 'right',
    //   sortType: 'basic',
    //   sortDescFirst: true,
    //   width: theme.spacing(14.5),
    //   marginRight: theme.spacing(1.25),
    // },
    {
      header: '',
      cell: LinkCell,
      accessorKey: 'view',
      textAlign: 'right',
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
  ];

  if (earnBorrowOption === 1) {
    tableColumns = tableColumns.filter(
      ({ accessorKey }) => accessorKey !== 'incentiveAPY'
    );
  }
  const selectedNetworkOptions = {
    0: '',
    1: Network.arbitrum,
    2: Network.mainnet,
  };

  const formatMarketData = (allMarketsData: typeof borrowYields) => {
    const getTotalIncentiveApy = (
      incentives: YieldData['noteIncentives'],
      secondaryIncentives: YieldData['secondaryIncentives']
    ) => {
      if (secondaryIncentives && incentives) {
        return incentives.incentiveAPY + secondaryIncentives.incentiveAPY;
      } else if (incentives && !secondaryIncentives) {
        return incentives.incentiveAPY;
      } else {
        return 0;
      }
    };

    const getIncentiveData = (
      incentives: YieldData['noteIncentives'],
      secondaryIncentives: YieldData['secondaryIncentives']
    ) => {
      if (secondaryIncentives && incentives) {
        return {
          inlineIcons: true,
          label: formatNumberAsPercent(incentives.incentiveAPY),
          symbol: incentives.symbol,
          caption: formatNumberAsPercent(secondaryIncentives.incentiveAPY),
          captionSymbol: secondaryIncentives.symbol,
        };
      } else if (incentives && !secondaryIncentives) {
        return {
          inlineIcons: true,
          label: formatNumberAsPercent(incentives.incentiveAPY),
          symbol: incentives.symbol,
        };
      } else {
        return {
          label: '',
          symbol: '',
        };
      }
    };

    const marketsData = selectedNetworkOptions[allNetworksOption]
      ? allMarketsData.filter(
          (data) =>
            data.token.network === selectedNetworkOptions[allNetworksOption]
        )
      : allMarketsData;

    return marketsData
      .map((data) => {
        const {
          underlying,
          token,
          totalAPY,
          product,
          noteIncentives,
          secondaryIncentives,
          leveraged,
          tvl,
          link,
        } = data;
        return {
          currency: underlying.symbol,
          product: product,
          //NOTE: This ensures that 0.00% is displayed instead of "-" in the cell
          totalAPY: totalAPY === 0 ? 0.00001 : totalAPY,
          maturity:
            !token.maturity || token.maturity === PRIME_CASH_VAULT_MATURITY
              ? 0
              : token.maturity,
          leverage:
            leveraged && leveraged.leverageRatio ? leveraged.leverageRatio : 0,
          totalTVL: tvl?.toFiat(baseCurrency).toFloat() || 0,
          incentiveAPY: getTotalIncentiveApy(
            noteIncentives,
            secondaryIncentives
          ),
          view: link,
          multiValueCellData: {
            currency: {
              symbol: underlying.symbol,
              symbolSize: 'large',
              label: underlying.symbol,
              network: token.network,
              caption:
                token.network.charAt(0).toUpperCase() + token.network.slice(1),
            },
            incentiveAPY: getIncentiveData(noteIncentives, secondaryIncentives),
          },
        };
      })
      .filter(({ product }) => product !== 'Leveraged Lend')
      .sort((a, b) => b.totalAPY - a.totalAPY);
  };

  const initialData =
    earnBorrowOption === 0
      ? formatMarketData(earnYields)
      : formatMarketData(borrowYields);

  const getIds = (options: SelectedOptions[]) => {
    return options.map(({ id }) => id);
  };

  const filterMarketData = () => {
    const currencyIds = getIds(currencyOptions);
    const productIds = getIds(productOptions);
    const filterData = [...currencyIds, ...productIds];

    if (filterData.length === 0) return initialData;

    if (productIds.length > 0 && currencyIds.length > 0) {
      return initialData
        .filter(({ currency }) => filterData.includes(currency))
        .filter(({ product }) => filterData.includes(product));
    }
    if (currencyIds.length > 0) {
      return initialData.filter(({ currency }) =>
        currencyIds.includes(currency)
      );
    }
    if (productIds.length > 0) {
      return initialData.filter(({ product }) => productIds.includes(product));
    }

    return [];
  };

  const marketTableColumns =
    earnBorrowOption === 1
      ? tableColumns.filter(
          ({ accessorKey }) =>
            accessorKey !== 'leverage' && accessorKey !== 'noteAPY'
        )
      : tableColumns;

  const marketTableData = filterMarketData();

  const marketDataCSVFormatter = useCallback((data: any[]) => {
    return data.map(
      ({
        currency,
        product,
        totalAPY,
        totalTVL,
        leverage,
        maturity,
        incentiveAPY,
      }) => {
        return {
          Currency: currency,
          Product: product,
          'Total APY': totalAPY === 0 ? '' : formatNumberAsPercent(totalAPY),
          'Total TVL': totalTVL === 0 ? '' : formatNumberAsAbbr(totalTVL),
          Leverage: leverage === 0 ? '' : formatLeverageRatio(leverage),
          Maturity: maturity === 0 ? '' : getDateString(maturity),
          IncentiveAPY:
            incentiveAPY === 0 ? '' : formatNumberAsPercent(incentiveAPY),
        };
      }
    );
  }, []);

  return { marketTableColumns, marketTableData, marketDataCSVFormatter };
};
