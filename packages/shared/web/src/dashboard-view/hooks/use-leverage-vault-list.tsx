import {
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatNumber,
} from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';
import {
  useAllVaults,
  useAccountDefinition,
  useVaultHoldings,
  useAppStore,
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
import { Box } from '@mui/material';
import { MultiTokenIcon, PointsIcon } from '@notional-finance/icons';
import { FiatKeys } from '@notional-finance/core-entities';

const RewardsCell = (props) => {
  const {
    cell: { getValue },
  } = props;
  const value = getValue();

  return (
    <Box>
      {value.rewardTokens.length > 0 ? (
        <MultiTokenIcon
          symbols={value.rewardTokens.map((t) => t.symbol)}
          size="medium"
          shiftSize={8}
        />
      ) : (
        value.label
      )}
    </Box>
  );
};

const ListColumns = (baseCurrency: FiatKeys): DataTableColumn[] => {
  return [
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
      displayFormatter: (val: string | number, symbol: string) => {
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
    {
      header: (
        <FormattedMessage
          defaultMessage="INCENTIVE APY"
          description={'INCENTIVE APY header'}
        />
      ),
      cell: MultiValueIconCell,
      accessorKey: 'incentiveApy',
      textAlign: 'right',
      sortType: 'basic',
      sortDescFirst: true,
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Rewards"
          description={'Rewards header'}
        />
      ),
      cell: RewardsCell,
      accessorKey: 'rewards',
      textAlign: 'right',
    },
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
};

export const useLeverageVaultList = (
  network: Network | undefined,
  vaultProduct: PRODUCTS
) => {
  const listedVaults = useAllVaults(network, vaultProduct);
  const { baseCurrency } = useAppStore();
  const account = useAccountDefinition(network);
  const vaultHoldings = useVaultHoldings(network);
  let listColumns = ListColumns(baseCurrency);

  if (vaultProduct === PRODUCTS.LEVERAGED_POINTS_FARMING) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'incentiveApy');
  }

  if (vaultProduct !== PRODUCTS.LEVERAGED_YIELD_FARMING) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'rewards');
  }

  if (account === undefined) {
    listColumns = listColumns.filter((x) => x.accessorKey !== 'walletBalance');
  }

  const listData = listedVaults
    .map((vault) => {
      const reinvestmentType =
        vaultProduct === PRODUCTS.LEVERAGED_YIELD_FARMING &&
        vault.vaultType === 'SingleSidedLP_DirectClaim'
          ? 'SingleSidedLP_DirectClaim'
          : vaultProduct === PRODUCTS.LEVERAGED_YIELD_FARMING
          ? 'SingleSidedLP'
          : undefined;

      const walletBalance = account
        ? account.balances.find((t) => t.tokenId === vault.primaryToken.id)
        : undefined;
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vault.vaultAddress
      )?.vault;
      const y = vault.maxVaultAPY;

      return {
        currency: {
          symbol: vault.primaryToken.symbol,
          symbolSize: 'large',
          symbolBottom: '',
          label: vault.primaryToken.symbol,
          caption: network
            ? network.charAt(0).toUpperCase() + network.slice(1)
            : '',
        },
        walletBalance: walletBalance?.toFloat() || 0,
        pool: vault.poolName,
        protocols:
          vault.boosterProtocol === vault.baseProtocol
            ? vault.baseProtocol
            : `${vault.boosterProtocol} / ${vault.baseProtocol}`,
        totalApy: profile?.totalAPY || y?.totalAPY || 0,
        incentiveApy: 0,
        tvl: vault.vaultTVL ? vault.vaultTVL.toFiat(baseCurrency).toFloat() : 0,
        view: profile
          ? `${PRODUCTS.VAULTS}/${network}/${vault.vaultAddress}/IncreaseVaultPosition`
          : `${PRODUCTS.VAULTS}/${network}/${vault.vaultAddress}/CreateVaultPosition?borrowOption=${y?.leveraged?.vaultDebt?.id}`,
        symbol: vault.primaryToken.symbol,
        borrowTerms: {
          data: [
            {
              displayValue:
                y?.leveraged?.debtToken.tokenType === 'fCash'
                  ? 'Fixed'
                  : 'Variable',
            },
            {
              displayValue: y?.leveraged?.debtToken?.maturity
                ? formatMaturity(y?.leveraged?.debtToken?.maturity)
                : '',
            },
          ],
        },
        reinvestmentTypeString: reinvestmentType,
        rewards: {
          label:
            reinvestmentType === 'SingleSidedLP'
              ? 'Auto-Reinvest'
              : 'Direct Claim',
          rewardTokens: vault.rewardTokens,
        },
        multiValueCellData: {
          currency: {
            symbol: vault.primaryToken.symbol,
            symbolSize: 'large',
            symbolBottom: '',
            label: vault.primaryToken.symbol,
            caption: network
              ? network.charAt(0).toUpperCase() + network.slice(1)
              : '',
            network: network,
          },
          totalApy: {
            label: y?.totalAPY
              ? formatNumberAsPercent(y.totalAPY, 2)
              : undefined,
            labelIsNegative: y?.totalAPY && y?.totalAPY < 0 ? true : false,
            caption: y?.leveraged?.leverageRatio
              ? `${formatNumber(y?.leveraged?.leverageRatio, 1)}x Leverage`
              : undefined,
          },
          incentiveApy:
            vaultProduct === PRODUCTS.LEVERAGED_POINTS_FARMING
              ? {
                  label: (
                    <Box
                      sx={{
                        display: 'flex',
                        fontSize: 'inherit',
                        alignItems: 'center',
                      }}
                    >
                      <PointsIcon sx={{ fontSize: 'inherit' }} />
                      &nbsp;Points
                    </Box>
                  ),
                }
              : undefined,
        },
      };
    })
    .sort((a, b) => b.walletBalance - a.walletBalance);

  return { listColumns, listData };
};
