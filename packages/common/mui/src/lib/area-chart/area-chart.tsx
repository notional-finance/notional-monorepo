import { SetStateAction, Dispatch, ReactNode } from 'react';
import { alpha, Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  formatNumberAsPercent,
  formatNumber,
  formatNumberAsAbbr,
} from '@notional-finance/helpers';
import { ONE_WEEK, getDateString } from '@notional-finance/util';
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
import { AxisDomain } from 'recharts/types/util/types';
import { useDefaultToolTips } from './use-default-tool-tips';
import { TimeSeriesDataPoint } from '@notional-finance/core-entities';

export interface AreaChartStylesProps {
  line?: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
  area: {
    lineColor: string;
    lineType: 'solid' | 'dashed' | 'dotted';
  };
}

export interface AreaChartProps {
  areaChartData: TimeSeriesDataPoint[];
  areaDataKey?: string;
  xAxisTickFormat?: 'date' | 'percent';
  yAxisTickFormat?: 'percent' | 'number' | 'usd' | 'double';
  yAxisDomain?: AxisDomain;
  referenceLineValue?: number;
  chartToolTipData?: ChartToolTipDataProps;
  areaChartStyles?: AreaChartStylesProps;
  headerCallBack?: Dispatch<SetStateAction<boolean>>;
  areaChartButtonLabel?: ReactNode;
  barChartButtonLabel?: ReactNode;
  showCartesianGrid?: boolean;
  isMultiChart?: boolean;
  areaLineType?: 'linear' | 'monotone';
  emptyStateMessage?: ReactNode;
  showEmptyState?: boolean;
  title?: string;
  xAxisTickCount?: number;
}

export const yAxisTickHandler = (
  yAxisTickFormat: AreaChartProps['yAxisTickFormat'],
  v: number
) => {
  if (yAxisTickFormat === 'percent' && typeof v === 'number') {
    return formatNumberAsPercent(v);
  } else if (yAxisTickFormat === 'usd' && typeof v === 'number') {
    return `${formatNumberAsAbbr(v, 2)}`;
  } else if (yAxisTickFormat === 'number' && typeof v === 'number') {
    return formatNumber(v, 2);
  } else if (yAxisTickFormat === 'double' && typeof v === 'number') {
    return formatNumber(v, 4);
  }
  return `${v}`;
};

export const AreaChart = ({
  areaChartData,
  areaDataKey = 'area',
  xAxisTickFormat = 'date',
  yAxisTickFormat = 'percent',
  yAxisDomain,
  referenceLineValue,
  areaChartStyles,
  chartToolTipData,
  showCartesianGrid,
  areaLineType = 'monotone',
  isMultiChart,
  emptyStateMessage,
  showEmptyState,
  title,
  xAxisTickCount = 0,
}: AreaChartProps) => {
  const theme = useTheme();

  const defaultChartToolTipData = useDefaultToolTips(yAxisTickFormat, title);

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

  return (
    <Box
      sx={{
        width: '100%',
        padding: isMultiChart ? '0px' : '',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(4),
        marginTop: theme.spacing(2),
        border: isMultiChart ? 'none' : '',
      }}
    >
      <ResponsiveContainer
        width="100%"
        height={300}
        className="responsive-container"
      >
        <ComposedChart
          data={areaChartData}
          margin={{ right: 10, left: 30, bottom: 30 }}
        >
          {showCartesianGrid && (
            <CartesianGrid
              vertical={false}
              height={300}
              stroke={theme.palette.borders.paper}
            />
          )}
          <Tooltip
            wrapperStyle={{ outline: 'none' }}
            content={
              <ChartToolTip
                areaDataKey={areaDataKey}
                chartToolTipData={
                  chartToolTipData ? chartToolTipData : defaultChartToolTipData
                }
              />
            }
            position={{ y: 0 }}
          />
          <XAxis
            dataKey="timestamp"
            type={xAxisTickFormat === 'date' ? 'category' : 'number'}
            tickCount={xAxisTickCount}
            tickSize={0}
            tickMargin={38}
            axisLine={{ stroke: theme.palette.borders.paper }}
            domain={
              xAxisTickFormat === 'date'
                ? [
                    (dataMin: number) => dataMin - ONE_WEEK,
                    (dataMax: number) => dataMax + ONE_WEEK,
                  ]
                : [(min: number) => min, (max: number) => max]
            }
            style={{
              fill: theme.palette.typography.light,
              fontSize: '12px',
            }}
            interval={0}
            tickFormatter={
              xAxisTickFormat === 'date' ? xAxisTickHandler : undefined
            }
            tick={
              xAxisTickFormat === 'percent' ? (
                <XAxisTick xAxisTickFormat={xAxisTickFormat} />
              ) : undefined
            }
            tickLine={false}
          />
          <YAxis
            type="number"
            orientation="left"
            yAxisId={0}
            domain={yAxisDomain}
            padding={{ top: 8 }}
            tickCount={5}
            tickMargin={20}
            width={60}
            scale={'linear'}
            tickSize={0}
            tickLine={false}
            axisLine={false}
            style={{ fill: theme.palette.typography.light, fontSize: '12px' }}
            tickFormatter={(v: number) => yAxisTickHandler(yAxisTickFormat, v)}
          />
          <Line
            type="monotone"
            dataKey="line"
            strokeWidth={1.5}
            stroke={
              areaChartStyles?.line?.lineColor || theme.palette.charts.main
            }
            strokeDasharray="3 3"
            dot={false}
            fillOpacity={1}
          />
          <Area
            type={areaLineType}
            strokeWidth={1.5}
            dataKey={areaDataKey}
            stroke={
              areaChartStyles?.area.lineColor || theme.palette.primary.light
            }
            dot={false}
            fillOpacity={0.2}
            fill={
              areaChartStyles?.area.lineColor || theme.palette.primary.light
            }
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
      {showEmptyState ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            width: theme.spacing(89.5),
            marginTop: `-${theme.spacing(32)}`,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              background: alpha(theme.palette.charts.dark, 0.75),
              color: theme.palette.typography.contrastText,
              padding: theme.spacing(3),
              borderRadius: theme.shape.borderRadius(),
              width: theme.spacing(25),
              textAlign: 'center',
            }}
          >
            {emptyStateMessage || (
              <FormattedMessage defaultMessage={'Fill in inputs to see data'} />
            )}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default AreaChart;
