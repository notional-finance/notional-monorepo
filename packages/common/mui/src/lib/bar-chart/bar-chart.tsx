import { useTheme } from '@mui/material';
import {
  BarChartToolTip,
  BarChartToolTipDataProps,
} from './bar-chart-tool-tip/bar-chart-tool-tip';
// import { ONE_WEEK } from '@notional-finance/util';
import {
  getDateString,
  formatNumberAsPercent,
  formatNumberToDigits,
  formatNumber,
} from '@notional-finance/helpers';
// import { XAxisTick } from './x-axis-tick/x-axis-tick';
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
// const data = [
//   {
//     name: 'Page A',
//     dataPointOne: 1000,
//     dataPointTwo: 2000,
//     total: 2400,
//   },
//   {
//     name: 'Page B',
//     dataPointOne: 3000,
//     dataPointTwo: 1398,
//     total: 2210,
//   },
//   {
//     name: 'Page C',
//     dataPointOne: 3800,
//     dataPointTwo: 1800,
//     total: 2290,
//   },
//   {
//     name: 'Page D',
//     dataPointOne: 4500,
//     dataPointTwo: 1908,
//     total: 2000,
//   },
//   {
//     name: 'Page E',
//     dataPointOne: 4890,
//     dataPointTwo: 1800,
//     total: 2181,
//   },
//   {
//     name: 'Page F',
//     dataPointOne: 4390,
//     dataPointTwo: 1300,
//     total: 2500,
//   },
//   {
//     name: 'Page G',
//     dataPointOne: 5000,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page H',
//     dataPointOne: 4490,
//     dataPointTwo: 900,
//     total: 2100,
//   },
//   {
//     name: 'Page I',
//     dataPointOne: 4490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page J',
//     dataPointOne: 4490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page K',
//     dataPointOne: 4490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page L',
//     dataPointOne: 4490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page M',
//     dataPointOne: 4490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page N',
//     dataPointOne: 5490,
//     dataPointTwo: 1300,
//     total: 2100,
//   },
//   {
//     name: 'Page O',
//     dataPointOne: 4100,
//     dataPointTwo: 1000,
//     total: 2100,
//   },
//   {
//     name: 'Page P',
//     dataPointOne: 3800,
//     dataPointTwo: 800,
//     total: 2100,
//   },
//   {
//     name: 'Page Q',
//     dataPointOne: 4100,
//     dataPointTwo: 900,
//     total: 2100,
//   },
//   {
//     name: 'Page R',
//     dataPointOne: 4000,
//     dataPointTwo: 1100,
//     total: 2100,
//   },
// ];

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
  barChartData: any[];
  xAxisTickFormat?: 'date' | 'percent';
  yAxisTickFormat?: 'percent' | 'number' | 'usd';
}

export const BarChart = ({
  barChartToolTipData,
  // barChartStyles,
  xAxisTickFormat = 'date',
  yAxisTickFormat = 'percent',
  barChartData,
}: BarChartProps) => {
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

  const yAxisTickHandler = (v: number) => {
    if (yAxisTickFormat === 'percent' && typeof v === 'number') {
      return formatNumberAsPercent(v);
    }
    if (yAxisTickFormat === 'usd' && typeof v === 'number') {
      return `$${formatNumberToDigits(v, 2)}`;
    }
    if (yAxisTickFormat === 'number' && typeof v === 'number') {
      return formatNumber(v, 2);
    }
    return `${v}`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart
        height={200}
        // barGap={'20%'}
        barCategoryGap={'30%'}
        data={barChartData}
        margin={{ top: 40, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid horizontal={true} vertical={false} />
        <XAxis
          dataKey="timestamp"
          axisLine={false}
          tickLine={false}
          type={xAxisTickFormat === 'date' ? 'category' : 'number'}
          // domain={[
          //   (dataMin: number) => dataMin - ONE_WEEK,
          //   (dataMax: number) => dataMax + ONE_WEEK,
          // ]}
          tickFormatter={xAxisTickHandler}
          // tick={<XAxisTick xAxisTickFormat={'date'} />}
          tickCount={3}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => yAxisTickHandler(v)}
        />
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={
            <BarChartToolTip barChartToolTipData={barChartToolTipData} />
          }
          cursor={{ fill: 'transparent' }}
          position={{ y: 0 }}
        />
        {/* <Bar
          dataKey="dataPointTwo"
          stackId="a"
          fill={barChartStyles?.dataSetTwo.lineColor}
        />  */}
        <Bar
          dataKey="dataPointOne"
          // stackId="a"
          fill={theme.palette.primary.light}
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
