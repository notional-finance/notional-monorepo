import { useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { PointsSeasonsData } from '../points-dashboard-constants';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatNumber, getDateString } from '@notional-finance/util';
import {
  useArbPoints,
  useTotalArbPoints,
} from '@notional-finance/notionable-hooks';

export const useYourPointsOverviewTables = () => {
  const theme = useTheme();
  const { season_one, season_two, season_three } = PointsSeasonsData;
  const totalPoints = useTotalArbPoints();
  const arbPoints = useArbPoints();
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
    []
  );

  return { yourPointsColumns, yourPointsData };
};
