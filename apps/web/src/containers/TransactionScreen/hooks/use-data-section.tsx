import { useTheme } from '@mui/material';
import TotalBox from '../components/total-box';
import { MultiDisplayChart } from '@notional-finance/mui';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import { getDateString } from '@notional-finance/util';
import {
  useAppStore,
  useChartData,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { ChartIcon } from '@notional-finance/icons';
import { useTotalsData } from '@notional-finance/lend-feature-shell/lend-fixed/hooks';
import { ChartType } from '@notional-finance/core-entities';
import { FormattedMessage } from 'react-intl';

export const useDataSection = () => {
  const theme = useTheme();
  const tradeContext = useCurrentTradeContext();
  const { collateral, deposit } = tradeContext?.selectedTokens ?? {};
  const { baseCurrency } = useAppStore();
  const totalsData = useTotalsData(deposit, collateral, baseCurrency);

  const { data: apyData } = useChartData(collateral, ChartType.APY);

  const contents = [
    {
      containerProps: {
        sx: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: theme.spacing(3),

          [theme.breakpoints.down('sm')]: {
            width: '100%',
            gap: theme.spacing(2),
          },
        },
      },
      content: totalsData.map((total, index) => (
        <TotalBox key={index} {...total} />
      )),
    },
    ...(apyData
      ? [
          {
            content: (
              <MultiDisplayChart
                chartComponents={[
                  {
                    headerButtons: {
                      buttons: [
                        {
                          label: 'APY',
                          onClick: () => {
                            console.log('APY');
                          },
                          value: 'APY',
                        },
                        {
                          label: 'Total Lent',
                          onClick: () => {
                            console.log('Total Lent');
                          },
                          value: 'Total Lent',
                        },
                      ],
                      containerProps: {
                        sx: {
                          position: 'unset',
                          border: `1px solid ${theme.palette.borders.default}`,
                          padding: theme.spacing(0.25),
                          width: 'fit-content',
                          borderRadius: theme.shape.borderRadius(),
                          '& .MuiToggleButtonGroup-root': {
                            marginRight: '0',
                          },
                          '& .MuiButtonBase-root': {
                            backgroundColor: 'transparent',
                          },
                        },
                      },
                    },
                    id: 'apy-area-chart',
                    title: 'APY',
                    hideTopGridLine: false,
                    Component: (
                      <LineChart
                        data={
                          apyData.data?.map(({ timestamp, totalAPY }) => ({
                            date: timestamp,
                            totalAPY,
                          })) || []
                        }
                        areaChartProps={{}}
                        lineConfig={[
                          {
                            dataKey: 'totalAPY',
                            title: (
                              <FormattedMessage defaultMessage="Current APY" />
                            ),
                            fill: 'black',
                            value: '--',
                          },
                        ]}
                        areaKey="totalAPY"
                        XAxisKey="date"
                        showYAxis={true}
                        tickFormatter={(value) => {
                          return getDateString(value, {
                            hideYear: true,
                          });
                        }}
                      />
                    ),
                  },
                ]}
              />
            ),
            containerProps: {
              sx: {
                width: '100%',
                flex: 1,
              },
            },
          },
        ]
      : []),
  ];

  return {
    title: 'Lending Info',
    button: {
      label: 'View Analytics',
      icon: <ChartIcon sx={{ fontSize: '16px !important' }} />,
      externalLink: 'https://notional.finance',
    },

    contents,
  };
};
