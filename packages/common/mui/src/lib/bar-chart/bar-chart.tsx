import { Box, styled } from '@mui/material';
import {
  AreaChartHeader,
  AreaHeaderData,
} from '../area-chart-header/area-chart-header';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
// import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2000,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 3800,
    pv: 1800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 4500,
    pv: 1908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 4890,
    pv: 1800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 4390,
    pv: 1300,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 5000,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page H',
    uv: 4490,
    pv: 900,
    amt: 2100,
  },
  {
    name: 'Page I',
    uv: 4490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page J',
    uv: 4490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page K',
    uv: 4490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page L',
    uv: 4490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page M',
    uv: 4490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page N',
    uv: 5490,
    pv: 1300,
    amt: 2100,
  },
  {
    name: 'Page O',
    uv: 4100,
    pv: 1000,
    amt: 2100,
  },
  {
    name: 'Page P',
    uv: 3800,
    pv: 800,
    amt: 2100,
  },
  {
    name: 'Page Q',
    uv: 4100,
    pv: 900,
    amt: 2100,
  },
  {
    name: 'Page R',
    uv: 4000,
    pv: 1100,
    amt: 2100,
  },
];

interface AreaChartStylesProps {
  lineColor: string;
}

interface AreaChartProps {
  areaHeaderData?: AreaHeaderData;
  areaChartStyles?: AreaChartStylesProps;
}

export const BarChart = ({
  areaHeaderData,
  areaChartStyles,
}: AreaChartProps) => {
  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      <ChartContainer>
        {areaHeaderData && (
          <AreaChartHeader
            areaHeaderData={areaHeaderData}
            areaChartStyles={areaChartStyles}
          />
        )}
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            height={200}
            barSize={10}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis axisLine={false} tickLine={false} dataKey="xAxisValue" />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" stackId="a" fill="#1C4E5C" />
            <Bar
              dataKey="uv"
              stackId="a"
              fill="#2DE1E8"
              radius={[8, 8, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
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

export default BarChart;
