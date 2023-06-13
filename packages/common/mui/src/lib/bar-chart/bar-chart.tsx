import {
  BarChartToolTip,
  BarChartToolTipDataProps,
} from './bar-chart-tool-tip/bar-chart-tool-tip';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// NOTE* Left this is an example of how to structure bar chart data
const data = [
  {
    name: 'Page A',
    dataPointOne: 1000,
    dataPointTwo: 2000,
    total: 2400,
  },
  {
    name: 'Page B',
    dataPointOne: 3000,
    dataPointTwo: 1398,
    total: 2210,
  },
  {
    name: 'Page C',
    dataPointOne: 3800,
    dataPointTwo: 1800,
    total: 2290,
  },
  {
    name: 'Page D',
    dataPointOne: 4500,
    dataPointTwo: 1908,
    total: 2000,
  },
  {
    name: 'Page E',
    dataPointOne: 4890,
    dataPointTwo: 1800,
    total: 2181,
  },
  {
    name: 'Page F',
    dataPointOne: 4390,
    dataPointTwo: 1300,
    total: 2500,
  },
  {
    name: 'Page G',
    dataPointOne: 5000,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page H',
    dataPointOne: 4490,
    dataPointTwo: 900,
    total: 2100,
  },
  {
    name: 'Page I',
    dataPointOne: 4490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page J',
    dataPointOne: 4490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page K',
    dataPointOne: 4490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page L',
    dataPointOne: 4490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page M',
    dataPointOne: 4490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page N',
    dataPointOne: 5490,
    dataPointTwo: 1300,
    total: 2100,
  },
  {
    name: 'Page O',
    dataPointOne: 4100,
    dataPointTwo: 1000,
    total: 2100,
  },
  {
    name: 'Page P',
    dataPointOne: 3800,
    dataPointTwo: 800,
    total: 2100,
  },
  {
    name: 'Page Q',
    dataPointOne: 4100,
    dataPointTwo: 900,
    total: 2100,
  },
  {
    name: 'Page R',
    dataPointOne: 4000,
    dataPointTwo: 1100,
    total: 2100,
  },
];

export interface BarChartStylesProps {
  dataSetOne: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
  dataSetTwo: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
}

export interface BarChartProps {
  barChartToolTipData?: BarChartToolTipDataProps;
  barChartStyles?: BarChartStylesProps;
}

export const BarChart = ({
  barChartToolTipData,
  barChartStyles,
}: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart
        height={200}
        barSize={10}
        data={data}
        margin={{ top: 40, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid horizontal={true} vertical={false} />
        <XAxis axisLine={false} tickLine={false} dataKey="xAxisValue" />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={
            <BarChartToolTip barChartToolTipData={barChartToolTipData} />
          }
          cursor={{ fill: 'transparent' }}
          position={{ y: 0 }}
        />
        <Bar
          dataKey="dataPointTwo"
          stackId="a"
          fill={barChartStyles?.dataSetTwo.lineColor}
        />
        <Bar
          dataKey="dataPointOne"
          stackId="a"
          fill={barChartStyles?.dataSetOne.lineColor}
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
