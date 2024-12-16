import { useTheme } from '@mui/material';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import {
  DataTableColumn,
  DisplayCell,
  LinkCell,
  IconCell,
  MultiValueIconCell,
  MultiValueCell,
} from '@notional-finance/mui';
import { useAllMarkets, useAppState } from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  formatNumberAsPercent,
  Network,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { TreeIcon } from '@notional-finance/icons';

export const useProductsTable = (selectedNetwork: Network) => {
  const theme = useTheme();
  const { baseCurrency } = useAppState();
  const {
    yields: { fCashLend, variableLend, liquidity },
  } = useAllMarkets(selectedNetwork);

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
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Product"
          description={'Product header'}
        />
      ),
      cell: MultiValueCell,
      accessorKey: 'product',
      textAlign: 'left',
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Boosted APY"
          description={'Boosted APY header'}
        />
      ),
      cell: IconCell,
      displayFormatter: formatNumberAsPercent,
      accessorKey: 'boostedAPY',
      showCustomIcon: true,
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(16),
    },
    {
      header: (
        <FormattedMessage defaultMessage="APY" description={'APY header'} />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'apy',
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
    },
    {
      header: (
        <FormattedMessage defaultMessage="TVL" description={'TVL header'} />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      cell: DisplayCell,
      displayFormatter: (val) =>
        formatNumberAsAbbr(val, 2, baseCurrency, { removeKAbbr: true }),
      accessorKey: 'tvl',
      textAlign: 'right',
    },
    {
      header: '',
      cell: LinkCell,
      accessorKey: 'view',
      textAlign: 'right',
      marginRight: theme.spacing(1.25),
    },
  ];

  const formatMarketData = (allMarketsData) => {
    return allMarketsData
      .filter((data) => data.product !== 'Leveraged Liquidity')
      .filter((data) => data.underlying.symbol === 'USDC')
      .map((data) => {
        const { underlying, product, tvl, link, totalAPY } = data;

        return {
          currency: underlying.symbol,
          product: {
            data: [
              { displayValue: product, isNegtive: false },
              {
                displayValue: data.token.maturity
                  ? formatMaturity(data.token.maturity)
                  : '',
                isNegtive: false,
              },
            ],
          },
          boostedAPY: totalAPY + 5,
          apy: totalAPY,
          tvl: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
          multiValueCellData: {
            currency: {
              symbol: underlying.symbol,
              symbolSize: 'large',
              label: underlying.symbol,
              network: selectedNetwork,
              caption: selectedNetwork
                ? selectedNetwork.charAt(0).toUpperCase() +
                  selectedNetwork.slice(1)
                : '',
            },
          },
          view: link,
          iconCellData: {
            icon: TreeIcon,
          },
        };
      });
  };

  const initialData = formatMarketData([
    ...fCashLend,
    ...variableLend,
    ...liquidity,
  ]);

  return { productsTableColumns: tableColumns, productsTableData: initialData };
};
