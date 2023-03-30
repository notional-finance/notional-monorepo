import { useTheme } from '@mui/material';
import { Box, styled } from '@mui/material';
import { useIntl } from 'react-intl';
import {
  AreaChartHeader,
  AreaHeaderData,
} from '../area-chart-header/area-chart-header';
import ProgressIndicator from '../progress-indicator/progress-indicator';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { ONE_WEEK } from '@notional-finance/shared-config';
import moment from 'moment';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartToolTip,
  ChartToolTipDataProps,
} from '../chart-tool-tip/chart-tool-tip';

interface AreaChartData {
  timestamp: number;
  line?: number;
  area?: number;
}
export interface AreaChartStylesProps {
  lineColor: string;
}

interface AreaChartProps {
  areaChartData: AreaChartData[];
  chartToolTipData?: ChartToolTipDataProps;
  areaHeaderData?: AreaHeaderData;
  areaChartStyles?: AreaChartStylesProps;
}

export const AreaChart = ({
  areaChartData,
  areaHeaderData,
  areaChartStyles,
  chartToolTipData,
}: AreaChartProps) => {
  const isLine = areaChartData[0]?.line;
  const theme = useTheme();
  const intl = useIntl();

  const xAxisTickHandler = (v: number, i: number) => {
    let result = '';
    if (typeof v === 'number') {
      // TODO: Fix all of this shit
      const prevMonth =
        i > 0
          ? intl.formatDate(areaChartData[i - 1]['timestamp'] * 1000, {
              month: 'short',
              year: 'numeric',
            })
          : '';
      const test = i > 0 ? areaChartData[i - 1]['timestamp'] * 1000 : 0;
      console.log({ test });
      const dateOne = moment(test);
      const dateTwo = moment(v * 1000);
      console.log({ dateTwo });
      const diff = dateTwo.diff(dateOne, 'days');

      const thisMonth = intl.formatDate(v * 1000, {
        month: 'short',
        year: 'numeric',
      });

      console.log({ diff });
      console.log({ prevMonth });
      console.log({ thisMonth });

      // Only label the axis on the first month
      result = prevMonth !== thisMonth ? thisMonth : '';
    }
    return result;
  };

  const CustomTickHandler = (props) => {
    const {
      x,
      y,
      payload: { value },
    } = props;

    return (
      <g transform={`translate(${x},${y})`} cursor={'pointer'}>
        <text x={0} y={0} dy={16} textAnchor="center">
          {intl.formatDate(value * 1000, {
            month: 'short',
            year: 'numeric',
          })}
        </text>
      </g>
    );
  };

  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      {areaChartData && areaChartData?.length > 0 ? (
        <ChartContainer>
          {areaHeaderData && (
            <AreaChartHeader
              areaHeaderData={areaHeaderData}
              areaChartStyles={areaChartStyles}
            />
          )}
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              height={200}
              data={areaChartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            >
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                content={<ChartToolTip chartToolTipData={chartToolTipData} />}
                position={{ y: 0 }}
              />
              <XAxis
                dataKey="timestamp"
                tickCount={0}
                axisLine={false}
                tickSize={0}
                tickMargin={20}
                domain={[
                  (dataMin: number) => dataMin - ONE_WEEK,
                  (dataMax: number) => dataMax + ONE_WEEK,
                ]}
                style={{ fill: theme.palette.typography.light }}
                interval={0}
                tickFormatter={isLine ? xAxisTickHandler : undefined}
                tick={!isLine ? <CustomTickHandler /> : undefined}
                tickLine={false}
              />
              <YAxis
                orientation="left"
                yAxisId={0}
                padding={{ top: 8 }}
                tickCount={6}
                tickMargin={12}
                width={60}
                tickSize={0}
                tickLine={false}
                axisLine={false}
                style={{ fill: theme.palette.typography.light }}
                tickFormatter={(v: number) => `${v.toFixed(2)}%`}
              />

              <Line
                type="monotone"
                dataKey="line"
                strokeWidth={1.5}
                stroke={areaChartStyles?.lineColor || theme.palette.charts.main}
                strokeDasharray="3 3"
                dot={false}
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="area"
                stroke={theme.palette.primary.light}
                dot={false}
                fillOpacity={1}
                fill="url(#colorPv)"
              />
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.charts.main}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.charts.main}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <Box sx={{ height: '400px', paddingTop: '140px' }}>
          <ProgressIndicator type="notional" />
        </Box>
      )}
    </TradeSummaryBox>
  );
};

const ChartContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  height: 100%;
  font-size: ${theme.typography.body1.fontSize};
  .recharts-area-curve {
    filter: drop-shadow(${theme.shape.chartLineShadow});
  }
`
);

export default AreaChart;
