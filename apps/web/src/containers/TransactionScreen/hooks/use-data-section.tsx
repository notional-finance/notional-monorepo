import { useTheme } from '@mui/material';
import { BarChartIcon } from '@notional-finance/icons';
import TotalBox from '../components/total-box';
import { MultiDisplayChart } from '@notional-finance/mui';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import { getDateString, SECONDS_IN_DAY } from '@notional-finance/util';
import { useTotalsChart } from '@notional-finance/portfolio-feature-shell/containers/portfolio-overview/hooks';
import { useAppStore } from '@notional-finance/notionable-hooks';

export const useDataSection = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();

  const { barChartData, barConfig, totalsData } = useTotalsChart(
    baseCurrency,
    SECONDS_IN_DAY * 2,
    SECONDS_IN_DAY * 2 * 30
  );

  const contents = [
    {
      label: 'Current Utilization',
      containerProps: {
        sx: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing(3),

          [theme.breakpoints.down('sm')]: {
            width: '100%',
            gap: theme.spacing(2),
          },
        },
      },
      content: (
        <>
          {[
            {
              title: 'Current Utilization',
              value: 1000,
              decimals: 2,
              suffix: '%',
              trend: {
                value: 5,
                direction: 'up' as const,
                duration: '30d',
              },
            },
            {
              title: 'Total Supplied',
              value: 1000,
              decimals: 2,
              suffix: ' ETH',
              trend: {
                value: 5,
                direction: 'up' as const,
                duration: '30d',
              },
            },
            {
              title: 'Total Borrowed',
              value: 1000,
              decimals: 2,
              suffix: ' ETH',
              trend: {
                value: 5,
                direction: 'down' as const,
                duration: '30d',
              },
            },
          ].map((totalBox) => (
            <TotalBox key={totalBox.title} {...totalBox} />
          ))}
        </>
      ),
    },
    ...(barChartData && barConfig && totalsData
      ? [
          {
            label: 'Lending Info',
            content: (
              <MultiDisplayChart
                chartComponents={[
                  {
                    chartHeaderTotalsData: totalsData,
                    id: 'apy-area-chart',
                    title: 'APY',
                    hideTopGridLine: false,
                    Component: (
                      <LineChart
                        data={
                          barChartData?.map(
                            ({
                              timestamp,
                              totalNetWorth,
                              totalAssets,
                              totalDebts,
                            }) => ({
                              date: timestamp,
                              totalNetWorth,
                              totalAssets,
                              totalDebts,
                            })
                          ) || []
                        }
                        areaChartProps={{}}
                        lineConfig={barConfig || []}
                        areaKey="totalNetWorth"
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
      icon: <BarChartIcon sx={{ fontSize: 16 }} />,
      externalLink: 'https://notional.finance',
    },

    contents,
  };
};
