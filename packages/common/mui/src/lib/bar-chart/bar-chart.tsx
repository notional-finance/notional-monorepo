import { BarChartToolTip } from './bar-chart-tool-tip/bar-chart-tool-tip';
import {
  formatNumberAsPercent,
  formatNumberToDigits,
  formatNumber,
} from '@notional-finance/helpers';
import { XAxisTick } from './x-axis-tick/x-axis-tick';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material';

export interface BarConfigProps {
  dataKey: string;
  fill: string;
  radius?: number[];
  title?: ReactNode;
  currencySymbol?: string;
}

export interface BarChartProps {
  barChartData: any[];
  barConfig: BarConfigProps[];
  xAxisTickFormat?: 'date' | 'percent';
  yAxisTickFormat?: 'percent' | 'number' | 'currency';
}

export const BarChart = ({
  yAxisTickFormat = 'percent',
  barChartData,
  barConfig,
}: BarChartProps) => {
  const theme = useTheme();
  const currencySymbol = barConfig[0].currencySymbol;

  const yAxisTickHandler = (v: number) => {
    if (yAxisTickFormat === 'percent' && typeof v === 'number') {
      return formatNumberAsPercent(v);
    }
    if (yAxisTickFormat === 'currency' && typeof v === 'number') {
      return `${currencySymbol}${formatNumberToDigits(v, 2)}`;
    }
    if (yAxisTickFormat === 'number' && typeof v === 'number') {
      return formatNumber(v, 2);
    }
    return `${v}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart
        barSize={8}
        data={barChartData}
        margin={{ top: 30, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid
          vertical={false}
          height={300}
          stroke={theme.palette.borders.paper}
        />
        <XAxis
          dataKey="timestamp"
          axisLine={false}
          tickLine={false}
          type={'category'}
          tick={<XAxisTick xAxisTickFormat={'date'} />}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => yAxisTickHandler(v)}
        />
        <Tooltip
          wrapperStyle={{ outline: 'none' }}
          content={<BarChartToolTip barConfig={barConfig} />}
          cursor={{ fill: 'transparent' }}
          position={{ y: 0 }}
        />
        {barConfig.map(({ dataKey, fill }, index) => (
          <Bar
            key={index}
            dataKey={dataKey}
            fill={fill}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// NOTE*
// stackId is used to stack bars on top of each other

export default BarChart;
