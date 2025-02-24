import { ReactNode } from 'react';
import { Box, Divider, useTheme } from '@mui/material';
import { Area, AreaChart, Tooltip, XAxis } from 'recharts';
import { LineChartToolTip } from './line-chart-tooltip/line-chart-tooltip';
import { getDateString } from '@notional-finance/util';

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
  lineConfig,
}: {
  data: any[];
  areaKey: string;
  XAxisKey: string;
  lineConfig: LineChartConfigProps[];
}) => {
  const theme = useTheme();

  // Compute ticks from the data based on the XAxisKey and remove the last tick
  const ticks = data.map((item) => item[XAxisKey]);
  const filteredTicks = ticks.length > 0 ? ticks.slice(0, -1) : ticks;

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <AreaChart
        width={window.innerWidth}
        height={200}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id={`color${areaKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={theme.palette.primary.main}
              stopOpacity={0.42}
            />
            <stop
              offset="95%"
              stopColor={theme.palette.primary.main}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          ticks={filteredTicks}
          dataKey={XAxisKey}
          axisLine={{
            stroke: theme.palette.borders.paper,
            strokeWidth: 1,
            fill: theme.palette.typography.white,
          }}
          tickLine={false}
          tickFormatter={(value) => {
            return getDateString(value, { monthOnly: true });
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
          stroke={theme.palette.primary.main}
          fill={`url(#color${areaKey})`}
        />
      </AreaChart>
      <Divider
        sx={{ borderColor: theme.palette.borders.paper, marginTop: '-5px' }}
      />
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

export default LineChart;
