import { SetStateAction, Dispatch, ReactNode } from 'react';
import { useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { getDateString } from '@notional-finance/helpers';
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
import {
  ChartToolTip,
  ChartToolTipDataProps,
} from '../chart-tool-tip/chart-tool-tip';

export interface AreaChartData {
  timestamp: number;
  line?: number;
  area?: number;
}
export interface AreaChartStylesProps {
  line: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
  area: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
}

export interface AreaChartProps {
  areaChartData: AreaChartData[];
  chartToolTipData?: ChartToolTipDataProps;
  areaChartStyles?: AreaChartStylesProps;
  headerCallBack?: Dispatch<SetStateAction<boolean>>;
  areaChartButtonLabel?: ReactNode;
  barChartButtonLabel?: ReactNode;
}

export const AreaChart = ({
  areaChartData,
  areaChartStyles,
  chartToolTipData,
}: AreaChartProps) => {
  const isLine = areaChartData[0]?.line;
  const theme = useTheme();
  const intl = useIntl();

  const xAxisTickHandler = (v: number, i: number) => {
    let result = '';
    if (typeof v === 'number') {
      const showTick = i % 15 === 0;
      const date = getDateString(v);
      result = showTick ? date.toUpperCase() : '';
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
          {typeof value === 'number'
            ? intl.formatDate(value * 1000, {
                month: 'short',
                year: 'numeric',
              })
            : ''}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        height={200}
        data={areaChartData}
        margin={{ top: 30, right: 43, left: 20, bottom: 20 }}
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
          stroke={areaChartStyles?.line.lineColor || theme.palette.charts.main}
          strokeDasharray="3 3"
          dot={false}
          fillOpacity={1}
        />
        <Area
          type="monotone"
          dataKey="area"
          stroke={
            areaChartStyles?.area.lineColor || theme.palette.primary.light
          }
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
  );
};

export default AreaChart;
