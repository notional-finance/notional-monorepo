import { Box, Divider, useTheme } from '@mui/material';
import { Area, AreaChart, Tooltip, XAxis } from 'recharts';

const LineChart = ({
  data,
  areaKey,
  XAxisKey,
}: {
  data: any[];
  areaKey: string;
  XAxisKey: string;
}) => {
  const theme = useTheme();
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
          dataKey={XAxisKey}
          axisLine={{
            stroke: theme.palette.borders.paper,
            strokeWidth: 1,
          }}
          tickLine={false}
        />
        <Tooltip />
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
