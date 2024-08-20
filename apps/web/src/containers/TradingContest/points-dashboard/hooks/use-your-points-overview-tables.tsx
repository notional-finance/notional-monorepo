import { useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import {
  PointsSeasonsData,
  useCurrentSeason,
} from '../points-dashboard-constants';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Network,
  SECONDS_IN_DAY,
  floorToMidnight,
  formatNumber,
  getDateString,
  getNowSeconds,
} from '@notional-finance/util';
import {
  usePortfolioHoldings,
  useTotalArbPoints,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  getArbBoosts,
  getPointsPerDay,
  Registry,
} from '@notional-finance/core-entities';
import { ArbPointsType } from '@notional-finance/notionable';

export const useYourPointsOverviewTables = (arbPoints: ArbPointsType[]) => {
  const theme = useTheme();
  const { season_one, season_two, season_three } = PointsSeasonsData;
  const totalPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();
  const portfolioHoldings = usePortfolioHoldings(Network.arbitrum);
  const vaultHoldings = useVaultHoldings(Network.arbitrum);
  const vaultPointsData = vaultHoldings
    .filter(({ vault: v }) => {
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
        return totalVaultPoints;
      });
      return totalVaultPoints > 0;
    })
    .map(({ vault: v }) => {
      const boostNum = getArbBoosts(v.vaultShares.token, false);
      const pointsPerDay = v.netWorth().toFiat('USD').toFloat() * boostNum;
      return { pointsPerDay };
    });

  const portfolioPointsData = portfolioHoldings
    .filter(({ balance: b }) => {
      const totalPointsNum =
        arbPoints?.find(({ token }) => token === b.tokenId)?.points || 0;
      return totalPointsNum > 0;
    })
    .map(({ balance: b }) => {
      const pointsPerDay = getPointsPerDay(b);
      return { pointsPerDay };
    });

  const sumPointsPerDay = portfolioPointsData.reduce(
    (sum, data) => sum + data.pointsPerDay,
    0
  );
  const sumVaultPointsPerDay = vaultPointsData.reduce(
    (sum, data) => sum + data.pointsPerDay,
    0
  );

  const yourPointsDay = sumPointsPerDay + sumVaultPointsPerDay;
  // This refers the the current season points total
  const yourPointsTotal =
    arbPoints?.reduce((sum, data) => sum + data[currentSeason.db_name], 0) || 0;
  const yourTotalPointsS1 =
    arbPoints?.reduce((sum, data) => sum + data.season_one, 0) || 0;
  const yourTotalPointsS2 =
    arbPoints?.reduce((sum, data) => sum + data.season_two, 0) || 0;
  const yourTotalPointsS3 =
    arbPoints?.reduce((sum, data) => sum + data.season_three, 0) || 0;

  const getDaysFromStartDate = (startDate: Date): number => {
    const timeDiff = Math.max(
      floorToMidnight(getNowSeconds()) - startDate.getTime() / 1000,
      SECONDS_IN_DAY
    );
    const daysDiff = Math.ceil(timeDiff / SECONDS_IN_DAY);
    return daysDiff;
  };

  const totalArbPointsBySeason = (arbPoints || []).reduce(
    (t, p) => {
      t.season_one += p.season_one;
      t.season_two += p.season_two;
      t.season_three += p.season_three;
      return t;
    },
    {
      season_one: 0,
      season_two: 0,
      season_three: 0,
    }
  );

  const yourPointsData = [
    {
      activeSeason: (
        <div>
          Season 1{' '}
          <span
            style={{
              fontSize: '14px',
              color: colors.greenGrey,
              fontWeight: '500',
              marginLeft: theme.spacing(0.5),
            }}
          >
            {`(${getDateString(season_one.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(season_one.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      totalPointsDay:
        currentSeason.db_name === 'season_one'
          ? formatNumber(
              totalPoints.season_one /
                getDaysFromStartDate(season_one.startDate),
              0
            )
          : '',
      yourPoints: formatNumber(yourTotalPointsS1, 0),
      yourPointsDay:
        currentSeason.db_name === 'season_one'
          ? formatNumber(yourPointsDay, 0)
          : '',
      totalPointsIssued: formatNumber(totalPoints.season_one, 0),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_one, 0),
      arbRewards: formatNumber(PointsSeasonsData.season_one.totalArb, 0),
    },
    {
      activeSeason: (
        <div>
          Season 2{' '}
          <span
            style={{
              fontSize: '14px',
              color: colors.greenGrey,
              fontWeight: '500',
              marginLeft: theme.spacing(0.5),
            }}
          >
            {`(${getDateString(season_two.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(season_two.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      totalPointsDay:
        currentSeason.db_name === 'season_two'
          ? formatNumber(
              totalPoints.season_two /
                getDaysFromStartDate(season_two.startDate),
              0
            )
          : '',
      yourPoints: formatNumber(yourTotalPointsS2, 0),
      yourPointsDay:
        currentSeason.db_name === 'season_two'
          ? formatNumber(yourPointsDay, 0)
          : '',
      totalPointsIssued: formatNumber(totalPoints.season_two, 0),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_two, 0),
      arbRewards: formatNumber(PointsSeasonsData.season_two.totalArb, 0),
    },
    {
      activeSeason: (
        <div>
          Season 3{' '}
          <span
            style={{
              fontSize: '14px',
              color: colors.greenGrey,
              fontWeight: '500',
              marginLeft: theme.spacing(0.5),
            }}
          >
            {`(${getDateString(season_three.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(season_three.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      totalPointsDay:
        currentSeason.db_name === 'season_three'
          ? formatNumber(
              totalPoints.season_three /
                getDaysFromStartDate(season_three.startDate),
              0
            )
          : '',
      yourPoints: formatNumber(yourTotalPointsS3, 0),
      yourPointsDay:
        currentSeason.db_name === 'season_three'
          ? formatNumber(yourPointsDay, 0)
          : '',
      totalPointsIssued: formatNumber(totalPoints.season_three, 0),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_three, 0),
      arbRewards: formatNumber(PointsSeasonsData.season_three.totalArb, 0),
    },
  ];

  const CustomCell = (props) => {
    const { getValue } = props;
    const value = getValue();

    return value;
  };

  const yourPointsColumns = useMemo<Array<any>>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Active Season"
            description={'Active Season header'}
          />
        ),
        accessorKey: 'activeSeason',
        cell: CustomCell,
        textAlign: 'left',
        fontSize: '16px',
        fontWeight: 600,
        padding: theme.spacing(2, 2, 2, 4),
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Your Points / Day"
            description={'Your Points Day header'}
          />
        ),
        accessorKey: 'yourPointsDay',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Total Points Issued / Day"
            description={'Total Points Issued Day header'}
          />
        ),
        accessorKey: 'totalPointsDay',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Your Points"
            description={'Your Points header'}
          />
        ),
        accessorKey: 'yourPoints',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Total Points Issued"
            description={'Total Points Issued header'}
          />
        ),
        accessorKey: 'totalPointsIssued',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="ARB Rewards"
            description={'ARB Rewards header'}
          />
        ),
        accessorKey: 'arbRewards',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
    ],
    [theme]
  );

  return { yourPointsColumns, yourPointsData, yourPointsTotal };
};
