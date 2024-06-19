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
  const { seasonOne, seasonTwo, seasonThree } = PointsSeasonsData;
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
            {`(${getDateString(seasonOne.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(seasonOne.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_one, 0),
      arbReceived: '-',
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
            {`(${getDateString(seasonTwo.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(seasonTwo.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_two, 0),
      arbReceived: '-',
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
            {`(${getDateString(seasonThree.startDate.getTime() / 1000, {
              hideYear: true,
            })} - ${getDateString(seasonThree.endDate.getTime() / 1000, {
              hideYear: true,
            })})`}
          </span>
        </div>
      ),
      yourTotalPoints: formatNumber(totalArbPointsBySeason.season_three, 0),
      arbReceived: '-',
    },
  ];

  const overviewData = [
    {
      totalPointsIssued: formatNumber(totalPoints.season_one, 0),
      totalArb: formatNumber(PointsSeasonsData.seasonOne.totalArb, 0),
    },
    {
      totalPointsIssued: formatNumber(totalPoints.season_two, 0),
      totalArb: formatNumber(PointsSeasonsData.seasonTwo.totalArb, 0),
    },
    {
      totalPointsIssued: formatNumber(totalPoints.season_three, 0),
      totalArb: formatNumber(PointsSeasonsData.seasonTwo.totalArb, 0),
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
            defaultMessage="Your Total Points"
            description={'Your Total Points header'}
          />
        ),
        accessorKey: 'yourTotalPoints',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="ARB Received"
            description={'Received header'}
          />
        ),
        accessorKey: 'arbReceived',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
    ],
    []
  );
  const overviewColumns = useMemo<Array<any>>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Total Points Issued"
            description={'Total Points Issued header'}
          />
        ),
        accessorKey: 'totalPointsIssued',
        padding: theme.spacing(2, 2, 2, 4),
        textAlign: 'left',
        fontSize: '16px',
        fontWeight: 600,
        width: '250px',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Total ARB"
            description={'Total ARB header'}
          />
        ),
        accessorKey: 'totalArb',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
      },
    ],
    []
  );

  return { yourPointsColumns, yourPointsData, overviewColumns, overviewData };
};
