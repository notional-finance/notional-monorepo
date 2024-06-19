import { useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { PointsSeasonsData } from '../points-dashboard-constants';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { getDateString } from '@notional-finance/util';

export const useYourPointsOverviewTables = () => {
  const theme = useTheme();
  const { seasonOne, seasonTwo, seasonThree } = PointsSeasonsData;

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
      pointsPerDay: '5,120.32',
      yourTotalPoints: '10,000.00',
      arbReceived: '',
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
      pointsPerDay: '5,120.32',
      yourTotalPoints: '10,000.00',
      arbReceived: '',
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
      pointsPerDay: '5,120.32',
      yourTotalPoints: '10,000.00',
      arbReceived: '',
    },
  ];

  const overviewData = [
    {
      totalPointsIssued: '1,250,000',
      remainingARB: '10,000',
    },
    {
      totalPointsIssued: '1,250,000',
      remainingARB: '10,000',
    },
    {
      totalPointsIssued: '-',
      remainingARB: '100,000',
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
            defaultMessage="Points per day"
            description={'Points per day header'}
          />
        ),
        accessorKey: 'pointsPerDay',
        textAlign: 'right',
        fontSize: '16px',
        fontWeight: 600,
        padding: '16px',
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
            defaultMessage="Points Received"
            description={'Points Received header'}
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
            defaultMessage="Remaining ARB"
            description={'Remaining ARB header'}
          />
        ),
        accessorKey: 'remainingARB',
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
