import { BarChartToolTip } from './bar-chart-tool-tip/bar-chart-tool-tip';
import {
  formatNumberAsPercent,
  formatNumberAsAbbr,
  formatNumber,
} from '@notional-finance/helpers';
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
import { getDateString } from '@notional-finance/util';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface BarConfigProps {
  dataKey: string;
  fill: string;
  value?: string;
  radius?: number[];
  title?: ReactNode;
  toolTipTitle?: ReactNode;
  currencySymbol?: string;
}

export interface BarChartProps {
  barChartData: any[];
  barConfig: BarConfigProps[];
  xAxisTickFormat?: 'date' | 'percent';
  yAxisTickFormat?: 'percent' | 'number' | 'currency';
  title?: string;
}

export const BarChart = ({
  yAxisTickFormat = 'percent',
  barChartData,
  barConfig,
  title,
}: BarChartProps) => {
  const theme = useTheme();

  const yAxisTickHandler = (v: number) => {
    if (yAxisTickFormat === 'percent' && typeof v === 'number') {
      return formatNumberAsPercent(v);
    }
    if (yAxisTickFormat === 'currency' && typeof v === 'number') {
      return formatNumberAsAbbr(v, 2);
    }
    if (yAxisTickFormat === 'number' && typeof v === 'number') {
      return formatNumber(v, 2);
    }
    return `${v}`;
  };

  const formatDate = (date) => {
    return getDateString(date, { hideYear: true });
  };

  console.log({ barChartData });
  console.log({ title });

  return (
    <Box>
      {barChartData.length === 0 ? (
        <Box sx={{ marginLeft: theme.spacing(3), marginTop: theme.spacing(6) }}>
          <FormattedMessage
            defaultMessage={'You have no active orders or historical data.'}
          />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart
            barSize={7}
            data={barChartData}
            margin={{ top: 30, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={theme.palette.borders.paper}
            />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              tickFormatter={formatDate}
              axisLine={{ stroke: theme.palette.borders.paper }}
              interval={0}
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
                stackId="1"
                fill={fill}
                radius={
                  index === barConfig.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

// NOTE*
// stackId is used to stack bars on top of each other

export default BarChart;
