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
import {
  useAppStore,
  useCurrentNetworkStore,
} from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  formatNumberAsPercent,
  Network,
  PRODUCTS,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { RocketIcon } from '@notional-finance/icons';

export const useProductsTable = (selectedNetwork: Network) => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const currentNetworkStore = useCurrentNetworkStore();
  const fCashLend = currentNetworkStore.getAllFCashYields();
  const variableLend = currentNetworkStore.getAllPrimeCashYields();
  const liquidity = currentNetworkStore.getAllNTokenYields();

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
      .filter(
        (data) =>
          data.underlying.symbol === 'USDC' || data.underlying.symbol === 'ETH'
      )
      .map((data) => {
        const { underlying, token, tvl, apy } = data;
        let link = '';
        let productTitle = '';
        if (token.tokenType === 'fCash') {
          productTitle = 'Fixed Lend';
          link = `${PRODUCTS.LEND_FIXED}/${selectedNetwork}/${underlying.symbol}`;
        } else if (token.tokenType === 'PrimeCash') {
          productTitle = 'Provide Liquidity';
          link = `${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}/${underlying.symbol}`;
        } else if (token.tokenType === 'nToken') {
          productTitle = 'Variable Lend';
          link = `${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}/${underlying.symbol}`;
        }

        return {
          currency: underlying.symbol,
          product: {
            data: [
              { displayValue: productTitle, isNegtive: false },
              {
                displayValue: data.token.maturity
                  ? formatMaturity(data.token.maturity)
                  : '',
                isNegtive: false,
              },
            ],
          },
          boostedAPY: apy?.totalAPY + 5,
          apy: apy?.totalAPY,
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
            icon: RocketIcon,
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
