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
import {
  useAllNetworkMarkets,
  useTotalArbPoints,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  PRODUCTS,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { getArbBoosts, getPointsAPY } from '@notional-finance/core-entities';
import { useCurrentSeason } from '../points-dashboard-constants';

export const useQualifyingProductsTable = (
  currencyOptions: SelectedOptions[],
  productOptions: SelectedOptions[]
) => {
  const theme = useTheme();
  const { earnYields, borrowYields } = useAllNetworkMarkets();
  const totalArbPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();
  const vaultHoldings = useVaultHoldings(Network.arbitrum);

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
        <FormattedMessage
          defaultMessage="APY Before Points"
          description={'APY Before Points header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'apyBeforePoints',
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
          defaultMessage="Points APY"
          description={'Points APY header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'pointsAPY',
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
    return allMarketsData
      .filter(
        (data) =>
          data.product !== 'Leveraged Liquidity' &&
          getArbBoosts(
            data.token,
            data.product === 'Fixed Borrow' ||
              data.product === 'Variable Borrow'
          ) > 0
      )
      .filter((data) =>
        data.product === 'Leveraged Vault'
          ? data.leveraged?.vaultDebt?.maturity === PRIME_CASH_VAULT_MATURITY
          : true
      )
      .map((data) => {
        const { underlying, token, totalAPY, product, link, vaultName } = data;
        const vaultAddress = data.leveraged?.vaultDebt?.vaultAddress;
        const vaultDebtOption = data.leveraged?.vaultDebt?.id;
        const boostNum = getArbBoosts(
          data.token,
          data.product === 'Fixed Borrow' || data.product === 'Variable Borrow'
        );
        const pointsAPY = getPointsAPY(
          boostNum,
          totalArbPoints[currentSeason.db_name],
          currentSeason.totalArb,
          currentSeason.startDate,
          currentSeason.endDate
        );
        const profile = vaultHoldings.find(
          (p) => p.vault.vaultAddress === vaultAddress
        )?.vault;
        return {
          currency: underlying.symbol,
          product: vaultName || product,
          id: vaultName ? 'Leveraged Vault' : product,
          totalAPY: product.includes('Borrow')
            ? totalAPY - pointsAPY
            : totalAPY + pointsAPY,
          // NOTE: This ensures that 0.00% is displayed instead of "-" in the cell
          apyBeforePoints: totalAPY === 0 ? 0.00001 : totalAPY,
          pointsAPY,
          view:
            data.product === 'Leveraged Vault' && profile
              ? `${PRODUCTS.VAULTS}/${Network.arbitrum}/${vaultAddress}/IncreaseVaultPosition`
              : data.product === 'Leveraged Vault' && !profile
              ? `${PRODUCTS.VAULTS}/${Network.arbitrum}/${vaultAddress}/CreateVaultPosition?borrowOption=${vaultDebtOption}`
              : link,
          boostNum,
          boost: `${getArbBoosts(
            data.token,
            data.product === 'Fixed Borrow' ||
              data.product === 'Variable Borrow'
          )}x`,
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
      .sort((a, b) => b.boostNum - a.boostNum);
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
        .filter(({ id }) => filterData.includes(id));
    }
    if (currencyIds.length > 0) {
      return initialData.filter(({ currency }) =>
        currencyIds.includes(currency)
      );
    }
    if (productIds.length > 0) {
      return initialData.filter(({ id }) => productIds.includes(id));
    }

    return [];
  };

  const productsTableColumns = tableColumns;

  const productsTableData = filterMarketData();

  return { productsTableColumns, productsTableData };
};
