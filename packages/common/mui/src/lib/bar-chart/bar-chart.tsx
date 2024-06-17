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
import { getDateString, ONE_WEEK } from '@notional-finance/util';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface BarConfigProps {
  dataKey: string;
  fill: string;
  value?: string | number;
  radius?: number | [number, number, number, number] | undefined;
  title?: ReactNode;
  toolTipTitle?: ReactNode;
  currencySymbol?: string;
}

export interface BarChartProps {
  barChartData: any[];
  barConfig: BarConfigProps[];
  xAxisTickFormat?: 'date' | 'percent';
  yAxisTickFormat?: 'percent' | 'number' | 'currency';
  isStackedBar?: boolean;
  title?: string;
}

export const BarChart = ({
  yAxisTickFormat = 'percent',
  xAxisTickFormat = 'date',
  barChartData,
  barConfig,
  isStackedBar = false,
}: BarChartProps) => {
  const theme = useTheme();

  const xAxisTickHandler = (v: number, i: number) => {
    let result = '';
    if (xAxisTickFormat === 'date') {
      if (typeof v === 'number') {
        const showTick = i % 15 === 0;
        const date = getDateString(v);
        result = showTick ? date.toUpperCase() : '';
      }
    }
    if (xAxisTickFormat === 'percent') {
      result = formatNumberAsPercent(v);
    }
    return result;
  };

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

  const isMobile = window.innerWidth < 756;

  return (
    <Box sx={{ overflowX: isMobile ? 'scroll' : '' }}>
      {barChartData.length === 0 ? (
        <Box
          sx={{
            margin: 'auto',
            height: isStackedBar ? theme.spacing(37.5) : '',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FormattedMessage
            defaultMessage={'You have no active orders or historical data.'}
          />
        </Box>
      ) : (
        <ResponsiveContainer width={isMobile ? 700 : '100%'} height={300}>
          <RechartsBarChart
            barSize={isStackedBar ? 4 : 8}
            data={barChartData}
            margin={{ top: 30, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={theme.palette.borders.paper}
            />

            {isStackedBar ? (
              <XAxis
                dataKey="timestamp"
                type={xAxisTickFormat === 'date' ? 'category' : 'number'}
                tickCount={0}
                tickSize={0}
                tickMargin={20}
                axisLine={{ stroke: theme.palette.borders.paper }}
                domain={[
                  (dataMin: number) => dataMin - ONE_WEEK,
                  (dataMax: number) => dataMax + ONE_WEEK,
                ]}
                style={{
                  fill: theme.palette.typography.light,
                  color: theme.palette.typography.light,
                  fontSize: '12px',
                }}
                interval={0}
                tickFormatter={xAxisTickHandler}
                tickLine={false}
              />
            ) : (
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                tickFormatter={formatDate}
                axisLine={{ stroke: theme.palette.borders.paper }}
                style={{
                  fill: theme.palette.typography.light,
                  fontSize: '12px',
                }}
                interval={0}
              />
            )}
            <YAxis
              tickLine={false}
              axisLine={false}
              style={{
                fill: theme.palette.typography.light,
                fontSize: '12px',
              }}
              tickFormatter={(v: number) => yAxisTickHandler(v)}
            />
            <Tooltip
              wrapperStyle={{ outline: 'none' }}
              content={
                <BarChartToolTip
                  barConfig={barConfig}
                  isStackedBar={isStackedBar}
                />
              }
              cursor={{ fill: 'transparent' }}
              position={{ y: 0 }}
            />

            {barConfig.map(({ dataKey, fill, radius }, index) => (
              <Bar
                key={index}
                dataKey={dataKey}
                stackId={isStackedBar ? '1' : undefined}
                fill={fill}
                radius={radius ? radius : [0, 0, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default BarChart;
