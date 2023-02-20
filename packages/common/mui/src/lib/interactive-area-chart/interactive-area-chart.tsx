import { useEffect, useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { XAxisDateTick } from './x-axis-date-tick/x-axis-date-tick';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import ProgressIndicator from '../progress-indicator/progress-indicator';
import { ONE_WEEK } from '@notional-finance/shared-config';
import { CustomDot } from './custom-dot/custom-dot';
import {
  AreaChartHeader,
  AreaHeaderData,
} from '../area-chart-header/area-chart-header';
import { useYAxis, YAxisTick } from './y-axis-tick';
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartToolTip,
  ChartToolTipDataProps,
} from '../chart-tool-tip/chart-tool-tip';

export interface InteractiveAreaChartData {
  timestamp: number;
  area: number;
  marketKey: string;
}

interface InteractiveAreaChartProps {
  interactiveAreaChartData: InteractiveAreaChartData[];
  onSelectMarketKey: (marketKey: string | null) => void;
  lockSelection?: boolean;
  selectedMarketKey?: string;
  chartToolTipData?: ChartToolTipDataProps;
  areaHeaderData?: AreaHeaderData;
}

export const InteractiveAreaChart = ({
  interactiveAreaChartData,
  chartToolTipData,
  areaHeaderData,
  onSelectMarketKey,
  selectedMarketKey,
  lockSelection,
}: InteractiveAreaChartProps) => {
  const { ticks, lines, maxTick } = useYAxis(interactiveAreaChartData);
  const [activeTimestamp, setActiveTimestamp] = useState<number>(0);
  const gridHeight = 260;
  const theme = useTheme();

  useEffect(() => {
    if (!selectedMarketKey) {
      setActiveTimestamp(0);
    }
    const selectedMarketData = interactiveAreaChartData.find(
      (data) => data?.marketKey === selectedMarketKey
    );
    if (selectedMarketData?.timestamp) {
      setActiveTimestamp(selectedMarketData?.timestamp);
    }
  }, [
    selectedMarketKey,
    interactiveAreaChartData,
    setActiveTimestamp,
    activeTimestamp,
  ]);

  const handleClick = (props) => {
    if (lockSelection) return;
    if (props.value !== activeTimestamp) {
      const selectedData = interactiveAreaChartData.find(
        (data) => data?.timestamp === props.value
      );
      if (selectedData?.marketKey) {
        onSelectMarketKey(selectedData.marketKey);
        setActiveTimestamp(props.value);
      }
    } else {
      onSelectMarketKey(null);
      setActiveTimestamp(0);
    }
  };

  return (
    <TradeSummaryBox sx={{ width: '100%', paddingBottom: theme.spacing(5) }}>
      {interactiveAreaChartData && interactiveAreaChartData?.length > 0 ? (
        <ChartContainer>
          {areaHeaderData && (
            <AreaChartHeader areaHeaderData={areaHeaderData} />
          )}
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={interactiveAreaChartData}
              margin={{ right: 30, left: 20 }}
            >
              <CartesianGrid
                vertical={false}
                horizontal
                height={gridHeight}
                horizontalPoints={lines}
                stroke={theme.palette.borders.paper}
              />
              <Tooltip
                content={<ChartToolTip chartToolTipData={chartToolTipData} />}
                position={{ y: 0 }}
                wrapperStyle={{ outline: 'none' }}
              />

              <XAxis
                dataKey="timestamp"
                axisLine={false}
                onClick={handleClick}
                domain={[
                  (dataMin: number) => dataMin - ONE_WEEK,
                  (dataMax: number) => dataMax + ONE_WEEK,
                ]}
                style={{ fill: theme.palette.typography.main }}
                tick={<XAxisDateTick activeTimestamp={activeTimestamp} />}
                tickLine={false}
              />
              <YAxis
                yAxisId="line"
                orientation="left"
                style={{ fill: theme.palette.typography.main }}
                ticks={ticks}
                tick={<YAxisTick lines={lines} values={ticks} />}
                unit="%"
                tickLine={false}
                axisLine={false}
                domain={[0, maxTick]}
              />
              <Area
                type="monotone"
                dataKey="area"
                strokeWidth={1.5}
                stroke={theme.palette.primary.light}
                isAnimationActive={false}
                yAxisId="line"
                fillOpacity={1}
                fill="url(#colorPv)"
                dot={<CustomDot activeTimestamp={activeTimestamp} />}
              />

              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={theme.palette.info.dark}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={theme.palette.info.dark}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <Box
          sx={{ height: theme.spacing(50), paddingTop: theme.spacing(17.5) }}
        >
          <ProgressIndicator type="notional" />
        </Box>
      )}
    </TradeSummaryBox>
  );
};

const ChartContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  height: 100%;
  font-size: ${theme.typography.body1.fontSize};
  .recharts-surface {
    overflow: visible;
  }
  .recharts-area-curve {
    filter: drop-shadow(${theme.shape.chartLineShadow});
  }
`
);

export default InteractiveAreaChart;
