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
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartData {
  timestamp: number;
  line: number;
  area: number;
}

interface AreaChartProps {
  areaChartData: AreaChartData[];
  CustomTooltip?: any;
  areaHeaderData?: AreaHeaderData;
}

export const AreaChart = ({
  areaChartData,
  CustomTooltip,
  areaHeaderData,
}: AreaChartProps) => {
  const isLine = areaChartData[0]?.line;
  const theme = useTheme();
  const intl = useIntl();

  const xAxisTickHandler = (v: number, i: number) => {
    let result = '';
    if (typeof v === 'number') {
      const prevMonth =
        i > 0
          ? intl.formatDate(areaChartData[i - 1]['timestamp'] * 1000, {
              month: 'short',
              year: 'numeric',
            })
          : '';
      const thisMonth = intl.formatDate(v * 1000, {
        month: 'short',
        year: 'numeric',
      });

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
          {areaHeaderData && <AreaChartHeader {...areaHeaderData} />}
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              height={200}
              data={areaChartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            >
              <Tooltip content={CustomTooltip} position={{ y: 0 }} />
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
                stroke={theme.palette.success.main}
                strokeDasharray="3 3"
                dot={false}
                fillOpacity={1}
                fill="red"
              />
              <Area
                type="monotone"
                dataKey="area"
                stroke={theme.palette.info.dark}
                dot={false}
                fillOpacity={1}
                fill="url(#colorPv)"
              />
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.info.dark}
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.info.dark}
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
`
);

export default AreaChart;
