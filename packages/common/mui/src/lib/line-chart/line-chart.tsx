import { ReactNode, useEffect, useRef, useState } from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChartToolTip } from './line-chart-tooltip/line-chart-tooltip';
import { getDateString } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { formatNumber } from '@notional-finance/helpers';
import { Margin } from 'recharts/types/util/types';

export interface LineChartConfigProps {
  dataKey: string;
  fill: string;
  value?: string | number;
  radius?: number | [number, number, number, number] | undefined;
  title?: ReactNode;
  toolTipTitle?: ReactNode;
  currencySymbol?: string;
}

const LineChart = ({
  data,
  areaKey,
  XAxisKey,
  showYAxis,
  lineConfig,
  tickFormatter,
  yAxisTickFormatter,
  areaChartProps,
}: {
  data: any[];
  areaKey: string;
  XAxisKey: string;
  showYAxis?: boolean;
  lineConfig: LineChartConfigProps[];
  tickFormatter?: (value: number) => string;
  yAxisTickFormatter?: (value: number) => string;
  areaChartProps?: {
    width?: number | undefined;
    height?: number | undefined;
    margin?: Margin;
  };
}) => {
  const theme = useTheme();
  const { isMobileView } = useAppStore();
  const [width, setWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileView) {
      setWidth(window.innerWidth);
    } else {
      setWidth(chartRef.current?.clientWidth ?? 0);
    }
  }, [isMobileView]);

  // Compute ticks from the data based on the XAxisKey and remove the last tick
  const ticks = data.map((item) => item[XAxisKey]);
  const filteredTicks = ticks.length > 0 ? ticks.slice(1, -1) : ticks;

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: '100%',
      }}
      ref={chartRef}
    >
      <AreaChart
        width={width}
        height={200}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        {...areaChartProps}
      >
        <defs>
          <linearGradient id={`color${areaKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={theme.palette.primary.light}
              stopOpacity={0.42}
            />
            <stop
              offset="95%"
              stopColor={theme.palette.primary.light}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        {showYAxis && (
          <>
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke={theme.palette.borders.paper}
              strokeWidth={1}
            />
            <YAxis
              tickCount={8}
              domain={[0, 'auto']}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: theme.palette.typography.light,
              }}
              tickFormatter={(value) => {
                return yAxisTickFormatter
                  ? yAxisTickFormatter(value)
                  : formatNumber(value, 0);
              }}
            />
          </>
        )}
        <XAxis
          ticks={filteredTicks}
          dataKey={XAxisKey}
          minTickGap={10}
          axisLine={{
            stroke: theme.palette.borders.paper,
            strokeWidth: 1,
            fill: theme.palette.typography.white,
          }}
          tickLine={false}
          tickFormatter={(value) => {
            return tickFormatter
              ? tickFormatter(value)
              : getDateString(value, { monthOnly: true });
          }}
          style={{
            fill: theme.palette.typography.light,
          }}
          padding={{
            left: 0,
            right: 0,
          }}
        />
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={<LineChartToolTip lineConfig={lineConfig} />}
          cursor={{ fill: 'transparent' }}
          position={{ y: 0 }}
        />
        <Area
          type="monotone"
          dataKey={areaKey}
          stroke={theme.palette.primary.light}
          fill={`url(#color${areaKey})`}
        />
      </AreaChart>
      <CustomDivider />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.background.paper,
          height: 25,
          zIndex: -1,
        }}
      ></Box>
    </Box>
  );
};

const CustomDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.borders.paper,
  marginTop: '-5px',
  [`${theme.breakpoints.up('sm')}`]: {
    display: 'none',
  },
}));

export default LineChart;
