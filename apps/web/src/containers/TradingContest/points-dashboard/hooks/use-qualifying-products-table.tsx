import { useTheme } from '@mui/material';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  IconCell,
  MultiValueIconCell,
  SelectedOptions,
} from '@notional-finance/mui';
import { PointsIcon } from '@notional-finance/icons';
import { useAllNetworkMarkets } from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useQualifyingProductsTable = (
  currencyOptions: SelectedOptions[],
  productOptions: SelectedOptions[]
) => {
  const theme = useTheme();
  const { earnYields, borrowYields } = useAllNetworkMarkets();

  const tableColumns: DataTableColumn[] = [
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
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage defaultMessage="Boost" description={'Boost header'} />
      ),
      cell: IconCell,
      accessorKey: 'boost',
      showCustomIcon: true,
      textAlign: 'right',
      width: theme.spacing(15.875),
      marginRight: theme.spacing(1.25),
    },
    {
      header: '',
      cell: LinkCell,
      accessorKey: 'view',
      textAlign: 'right',
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
  ];

  const formatMarketData = (allMarketsData: typeof borrowYields) => {
    const marketsData = allMarketsData.filter(
      (data) =>
        data.token.network === Network.arbitrum &&
        data.product !== 'Provide Liquidity' &&
        data.product !== 'Leveraged Liquidity' &&
        data.product !== 'Leveraged Lend'
    );

    return marketsData
      .map((data) => {
        const { underlying, token, totalAPY, product, link } = data;
        return {
          currency: underlying.symbol,
          product: product,
          //NOTE: This ensures that 0.00% is displayed instead of "-" in the cell
          totalAPY: totalAPY === 0 ? 0.00001 : totalAPY,
          view: link,
          boost: '6x',
          multiValueCellData: {
            currency: {
              symbol: underlying.symbol,
              symbolSize: 'large',
              label: underlying.symbol,
              network: token.network,
              caption:
                token.network.charAt(0).toUpperCase() + token.network.slice(1),
            },
          },
          iconCellData: {
            icon: PointsIcon,
          },
        };
      })
      .sort((a, b) => b.totalAPY - a.totalAPY);
  };

  const initialData = formatMarketData([...earnYields, ...borrowYields]);

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

  const productsTableColumns = tableColumns;

  const productsTableData = filterMarketData();

  return { productsTableColumns, productsTableData };
};
