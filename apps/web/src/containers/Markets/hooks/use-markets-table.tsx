import { useCallback } from 'react';
import {
  MultiValueIconCell,
  LinkCell,
  DisplayCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/shared-config';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import {
  formatNumberAsPercent,
  getDateString,
  formatLeverageRatio,
  formatNumberAsAbbr,
  formatYieldCaption,
} from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useMarketsTable = (
  marketType: MARKET_TYPE,
  currencyOptions: string[],
  productOptions: string[]
) => {
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
      accessor: 'currency',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Product"
          description={'Product header'}
        />
      ),
      Cell: DisplayCell,
      accessor: 'product',
      textAlign: 'left',
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
    },
    {
      Header: '',
      Cell: LinkCell,
      accessor: 'view',
      textAlign: 'right',
    },
  ];

  const formatMarketData = (allMarketsData) => {
    return allMarketsData.map((data) => {
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
        totalTVL: tvl.toFiat('USD').toFloat() || 0,
        noteAPY:
          incentives && incentives.length > 0 && incentives[0]?.incentiveAPY > 0
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
    });
  };

  const initialData =
    marketType === MARKET_TYPE.BORROW
      ? formatMarketData(borrowYields)
      : formatMarketData(earnYields);

  const filterMarketData = () => {
    const filterData = [...currencyOptions, ...productOptions];

    if (filterData.length === 0) return initialData;

    if (productOptions.length > 0 && currencyOptions.length > 0) {
      return initialData
        .filter(({ currency }) => filterData.includes(currency))
        .filter(({ product }) => filterData.includes(product));
    }
    if (currencyOptions.length > 0) {
      return initialData.filter(({ currency }) =>
        currencyOptions.includes(currency)
      );
    }
    if (productOptions.length > 0) {
      return initialData.filter(({ product }) =>
        productOptions.includes(product)
      );
    }
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
