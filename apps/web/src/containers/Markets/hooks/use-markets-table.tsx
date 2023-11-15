import { useCallback } from 'react';
import {
  MultiValueIconCell,
  LinkCell,
  DisplayCell,
  DataTableColumn,
  SelectedOptions,
} from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/util';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import {
  formatNumberAsPercent,
  getDateString,
  formatLeverageRatio,
  formatNumberAsAbbr,
  formatYieldCaption,
} from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';

export const useMarketsTable = (
  marketType: MARKET_TYPE,
  currencyOptions: SelectedOptions[],
  productOptions: SelectedOptions[]
) => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const { earnYields, borrowYields } = useAllMarkets();

  const tableColumns: DataTableColumn[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      Cell: MultiValueIconCell,
      className: 'sticky-column',
      accessor: 'currency',
      textAlign: 'left',
      width: theme.spacing(18.75),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Product"
          description={'Product header'}
        />
      ),
      accessor: 'product',
      textAlign: 'left',
      width: theme.spacing(15.875),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total APY"
          description={'Total APY header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      Cell: DisplayCell,
      accessor: 'totalAPY',
      textAlign: 'left',
      sortType: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total TVL"
          description={'Total TVL header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: formatNumberAsAbbr,
      accessor: 'totalTVL',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Leverage"
          description={'Leverage header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: formatLeverageRatio,
      accessor: 'leverage',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
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
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Note APY"
          description={'Note APY header'}
        />
      ),
      Cell: DisplayCell,
      displayFormatter: formatNumberAsPercent,
      accessor: 'noteAPY',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      Header: '',
      Cell: LinkCell,
      accessor: 'view',
      textAlign: 'right',
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
  ];

  const formatMarketData = (allMarketsData: typeof borrowYields) => {
    return allMarketsData
      .map((data) => {
        const {
          underlying,
          token,
          totalAPY,
          product,
          incentives,
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
          noteAPY:
            incentives &&
            incentives.length > 0 &&
            incentives[0]?.incentiveAPY > 0
              ? incentives[0]?.incentiveAPY
              : 0,
          view: link,
          multiValueCellData: {
            currency: {
              symbol: underlying.symbol,
              label: underlying.symbol,
              caption: formatYieldCaption(data),
            },
          },
        };
      })
      .filter(({ product }) => product !== 'Leveraged Lend');
  };

  const initialData =
    marketType === MARKET_TYPE.BORROW
      ? formatMarketData(borrowYields)
      : formatMarketData(earnYields);

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
    marketType === MARKET_TYPE.BORROW
      ? tableColumns.filter(
          ({ accessor }) => accessor !== 'leverage' && accessor !== 'noteAPY'
        )
      : tableColumns;

  const marketTableData = filterMarketData();

  const marketDataCSVFormatter = useCallback((data: any[]) => {
    return data.map(
      ({ currency, product, totalAPY, totalTVL, leverage, maturity }) => {
        return {
          Currency: currency,
          Product: product,
          'Total APY': totalAPY === 0 ? '' : formatNumberAsPercent(totalAPY),
          'Total TVL': totalTVL === 0 ? '' : formatNumberAsAbbr(totalTVL),
          Leverage: leverage === 0 ? '' : formatLeverageRatio(leverage),
          Maturity: maturity === 0 ? '' : getDateString(maturity),
        };
      }
    );
  }, []);

  return { marketTableColumns, marketTableData, marketDataCSVFormatter };
};
