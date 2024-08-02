import { Box, useTheme } from '@mui/material';
import {
  getArbBoosts,
  getPointsAPY,
  getPointsPerDay,
  Registry,
} from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { PointsIcon } from '@notional-finance/icons';
import {
  DataTableColumn,
  DisplayCell,
  IconCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  useArbPoints,
  usePortfolioHoldings,
  useTotalArbPoints,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import {
  Network,
  PRIME_CASH_VAULT_MATURITY,
  formatMaturity,
  formatNumber,
  formatNumberAsPercent,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useCurrentSeason } from '../points-dashboard-constants';

export const useMyBreakdownTable = () => {
  const theme = useTheme();
  const portfolioHoldings = usePortfolioHoldings(Network.arbitrum);
  const vaultHoldings = useVaultHoldings(Network.arbitrum);
  const arbPoints = useArbPoints();
  const totalArbPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();

  const AccentCell = ({ cell }) => {
    const { getValue } = cell;
    const value = getValue();
    return <Box sx={{ color: colors.neonTurquoise }}>{value}</Box>;
  };

  const tableColumns: DataTableColumn[] = [
    {
      header: <FormattedMessage defaultMessage="Asset" />,
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage defaultMessage="Boost" description={'Boost header'} />
      ),
      cell: IconCell,
      showCustomIcon: true,
      accessorKey: 'boost',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Points Per Day"
          description={'Points Per Day header'}
        />
      ),
      accessorKey: 'pointsPerDay',
      textAlign: 'right',
      width: theme.spacing(15.875),
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
        <FormattedMessage
          defaultMessage="Total Points"
          description={'Total Points header'}
        />
      ),
      cell: AccentCell,
      accessorKey: 'totalPoints',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
  ];

  const vaultTableData = vaultHoldings
    .map(({ vault: v, denom }) => {
      const config = v.vaultConfig;
      const boostNum = getArbBoosts(v.vaultShares.token, false);
      const pointsPerDay = v.netWorth().toFiat('USD').toFloat() * boostNum;
      let totalVaultPoints = 0;
      arbPoints?.map(({ token, points }) => {
        const tokenData = Registry?.getTokenRegistry()?.getTokenByID(
          Network.arbitrum,
          token
        );
        if (
          tokenData.tokenType === 'VaultShare' &&
          tokenData.totalSupply?.vaultAddress === v.vaultAddress
        ) {
          if (points > 0) {
            totalVaultPoints = points;
          }
        }
        return tokenData;
      });

      const pointsAPY = getPointsAPY(
        boostNum,
        totalArbPoints[currentSeason.db_name],
        currentSeason.totalArb,
        currentSeason.startDate,
        currentSeason.endDate
      );

      return {
        asset: {
          symbol: formatTokenType(denom).icon,
          label: config.name,
          caption:
            v.maturity === PRIME_CASH_VAULT_MATURITY
              ? 'Open Term'
              : `Maturity: ${formatMaturity(v.maturity)}`,
        },
        totalPointsNum: totalVaultPoints,
        boost: `${boostNum}x`,
        pointsPerDayNum: pointsPerDay,
        pointsPerDay: formatNumber(pointsPerDay),
        pointsAPY,
        totalPoints: formatNumber(totalVaultPoints),
        iconCellData: {
          icon: PointsIcon,
        },
      };
    })
    .filter(({ totalPointsNum }) => totalPointsNum > 0);

  const portfolioTableData = portfolioHoldings
    .map((data) => {
      const { balance: b } = data;
      const isDebt = b.isNegative();
      const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
        b.token,
        isDebt
      );

      const boostNum = getArbBoosts(b.token, isDebt);
      const pointsPerDay = getPointsPerDay(b);

      const totalPoints =
        arbPoints?.find(({ token }) => token === b.tokenId)?.points || 0;

      const pointsAPY = getPointsAPY(
        boostNum,
        totalArbPoints[currentSeason.db_name],
        currentSeason.totalArb,
        currentSeason.startDate,
        currentSeason.endDate
      );

      return {
        asset: {
          symbol: icon,
          symbolBottom: '',
          label: formattedTitle,
          caption: titleWithMaturity,
        },
        totalPointsNum: totalPoints,
        pointsPerDayNum: pointsPerDay,
        pointsAPY: pointsAPY === Infinity ? 0 : pointsAPY,
        boost: `${boostNum}x`,
        pointsPerDay: formatNumber(pointsPerDay),
        totalPoints: formatNumber(totalPoints),
        iconCellData: {
          icon: PointsIcon,
        },
      };
    })
    .filter(({ totalPointsNum }) => totalPointsNum > 0);

  const filterIds = [...portfolioHoldings, ...vaultHoldings].map(
    (data: any) => {
      if (data?.vault) {
        return data?.vault.vaultAddress;
      } else {
        return data?.balance.tokenId;
      }
    }
  );

  const historicalPoints =
    arbPoints
      ?.filter(({ token }) => {
        const tokenData = Registry?.getTokenRegistry()?.getTokenByID(
          Network.arbitrum,
          token
        );
        if (
          tokenData.tokenType === 'VaultShare' &&
          filterIds.includes(tokenData.totalSupply?.vaultAddress)
        ) {
          return false;
        } else if (!filterIds.includes(token)) {
          return true;
        } else {
          return false;
        }
      })
      ?.map((pointsData) => {
        const tokenData = Registry?.getTokenRegistry()?.getTokenByID(
          Network.arbitrum,
          pointsData.token
        );
        let vaultAsset: any = undefined;

        if (tokenData.tokenType === 'VaultShare' && tokenData?.vaultAddress) {
          const config = Registry.getConfigurationRegistry();
          const vaultConfig = config.getVaultConfig(
            Network.arbitrum,
            tokenData?.vaultAddress
          );
          vaultAsset = {
            symbol: tokenData.totalSupply?.underlying?.symbol,
            label: vaultConfig?.name,
            caption:
              tokenData?.maturity === PRIME_CASH_VAULT_MATURITY
                ? 'Open Term'
                : `Maturity: ${formatMaturity(tokenData?.maturity || 0)}`,
          };
        }

        const isDebt =
          tokenData?.tokenType.includes('Debt') || tokenData.isFCashDebt;
        const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
          tokenData,
          isDebt
        );
        const boostNum = getArbBoosts(tokenData, false);

        return {
          asset: tokenData?.vaultAddress
            ? vaultAsset
            : {
                symbol: icon,
                symbolBottom: '',
                label: formattedTitle,
                caption: titleWithMaturity,
              },
          totalPointsNum: pointsData.points,
          pointsPerDayNum: 0,
          pointsAPY: 0,
          boost: `${boostNum}x`,
          pointsPerDay: '-',
          totalPoints: formatNumber(pointsData.points),
          iconCellData: {
            icon: PointsIcon,
          },
        };
      })
      .filter(({ totalPointsNum }) => totalPointsNum > 0) || ([] as any[]);

  const tableData = [
    ...vaultTableData,
    ...portfolioTableData,
    ...historicalPoints,
  ].sort((a, b) => b.pointsPerDayNum - a.pointsPerDayNum);

  return { tableColumns, tableData };
};
