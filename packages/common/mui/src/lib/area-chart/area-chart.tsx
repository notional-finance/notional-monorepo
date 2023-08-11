import { SetStateAction, Dispatch, ReactNode } from 'react';
import { useTheme } from '@mui/material';
import { getDateString } from '@notional-finance/helpers';
import { ONE_WEEK } from '@notional-finance/shared-config';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ReferenceLine,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartToolTip,
  ChartToolTipDataProps,
} from '../chart-tool-tip/chart-tool-tip';
import { XAxisTick } from './x-axis-tick/x-axis-tick';

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
  xAxisTickFormat?: 'date' | 'percent';
  referenceLineValue?: number;
  chartToolTipData?: ChartToolTipDataProps;
  areaChartStyles?: AreaChartStylesProps;
  headerCallBack?: Dispatch<SetStateAction<boolean>>;
  areaChartButtonLabel?: ReactNode;
  barChartButtonLabel?: ReactNode;
  showCartesianGrid?: boolean;
}

export const AreaChart = ({
  areaChartData,
  xAxisTickFormat = 'date',
  referenceLineValue,
  areaChartStyles,
  chartToolTipData,
  showCartesianGrid,
}: AreaChartProps) => {
  const isLine = areaChartData[0]?.line;
  const theme = useTheme();

  const xAxisTickHandler = (v: number, i: number) => {
    let result = '';
    if (typeof v === 'number') {
      const showTick = i % 15 === 0;
      const date = getDateString(v);
      result = showTick ? date.toUpperCase() : '';
    }
    return result;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        height={200}
        data={areaChartData}
        margin={{ top: 30, right: 20, left: 20, bottom: 20 }}
      >
        {showCartesianGrid && (
          <CartesianGrid
            vertical={false}
            horizontal
            height={400}
            stroke={theme.palette.borders.paper}
          />
        )}
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={<ChartToolTip chartToolTipData={chartToolTipData} />}
          position={{ y: 0 }}
        />
        <XAxis
          dataKey="timestamp"
          type={xAxisTickFormat === 'date' ? 'category' : 'number'}
          tickCount={0}
          axisLine={false}
          tickSize={0}
          tickMargin={20}
          domain={
            xAxisTickFormat === 'date'
              ? [
                  (dataMin: number) => dataMin - ONE_WEEK,
                  (dataMax: number) => dataMax + ONE_WEEK,
                ]
              : [(min: number) => min, (max: number) => max]
          }
          style={{ fill: theme.palette.typography.light }}
          interval={0}
          tickFormatter={isLine ? xAxisTickHandler : undefined}
          tick={
            !isLine ? (
              <XAxisTick xAxisTickFormat={xAxisTickFormat} />
            ) : undefined
          }
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
          style={{ fill: theme.palette.typography.light, fontSize: '12px' }}
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
          fillOpacity={0.2}
          fill={areaChartStyles?.area.lineColor || theme.palette.primary.light}
        />
        {referenceLineValue && (
          <ReferenceLine
            x={referenceLineValue}
            strokeDasharray="5,5"
            stroke={theme.palette.background.accentPaper}
            strokeWidth={2}
          />
        )}

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
