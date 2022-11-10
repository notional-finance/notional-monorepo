import { Box, useTheme, styled } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { H4, Label, TradeSummaryBox } from '@notional-finance/mui';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Tooltip,
  XAxis,
  YAxis,
  Area,
  ResponsiveContainer,
  Line,
  TooltipProps,
  ComposedChart,
} from 'recharts';
import { HistoricalReturn } from '../hooks/use-historical-returns';
import { messages } from '../messages';
import { countUpLeverageRatio } from '@notional-finance/trade';

const ONE_WEEK = 86400 * 7;

interface PerformanceChartProps {
  historicalReturns: HistoricalReturn[];
  leverageRatio?: number;
  currentBorrowRate?: number;
}

const Legend = styled('span')`
  align-items: center;
  display: flex;
`;

const LegendItem = styled(H4)(
  ({ theme }) => `
  margin-left: ${theme.spacing(3)};
  padding-left: ${theme.spacing(2)};
  border-left: 2px;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
`
);

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(1)};
`
);

const ChartContainer = styled(Box)(
  ({ theme }) => `
  width: 100%;
  height: 100%;
  font-size: ${theme.typography.body1.fontSize};
`
);

const ToolTipBox = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  text-align: left;
  box-shadow: ${theme.shape.shadowStandard}
`
);

export const PerformanceChart = ({
  historicalReturns,
  leverageRatio,
  currentBorrowRate,
}: PerformanceChartProps) => {
  const theme = useTheme();
  const intl = useIntl();
  const renderTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload } = props;
    if (active && payload) {
      const { timestamp, totalRate, breakdown } = payload[0].payload;

      return (
        <ToolTipBox>
          <Label>
            <FormattedMessage
              {...messages.summary.date}
              values={{ date: getDateString(timestamp) }}
            />
          </Label>
          {(breakdown as string[]).map((b: string, i: number) => {
            return <Label key={`breakdown-${i}`}>{b}</Label>;
          })}
          <Label key="total-rate" fontWeight="medium">
            <FormattedMessage
              {...messages.summary.performanceTotalReturns}
              values={{ returns: formatNumberAsPercent(totalRate) }}
            />
          </Label>
        </ToolTipBox>
      );
    }

    return null;
  };

  return (
    <TradeSummaryBox>
      <HeadingContainer>
        <H4>
          <FormattedMessage {...messages.summary.performance} />
        </H4>
        <Legend>
          <LegendItem
            inline
            sx={{
              borderColor: theme.palette.success.main,
              borderStyle: 'dotted',
              visibility: currentBorrowRate ? 'visible' : 'hidden',
            }}
          >
            <FormattedMessage
              {...messages.summary.leveragedReturns}
              values={{
                leverageRatio: leverageRatio
                  ? countUpLeverageRatio(leverageRatio)
                  : '',
              }}
            />
          </LegendItem>
          <LegendItem
            inline
            sx={{
              borderColor: theme.palette.primary.light,
              borderStyle: 'solid',
            }}
          >
            <FormattedMessage {...messages.summary.returns} />
          </LegendItem>
        </Legend>
      </HeadingContainer>
      <ChartContainer>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            height={200}
            data={historicalReturns}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Tooltip content={renderTooltip} position={{ y: 0 }} />
            <XAxis
              dataKey="timestamp"
              tickCount={6}
              axisLine={false}
              tickSize={0}
              tickMargin={20}
              domain={[
                (dataMin: number) => dataMin - ONE_WEEK,
                (dataMax: number) => dataMax + ONE_WEEK,
              ]}
              // Changes default font color for axis
              style={{ fill: theme.palette.typography.main }}
              // Interval must be set to 0 in order to override automatic axis labels
              // and have them set via the tickFormatter
              interval={0}
              tickFormatter={(v: number, i: number) => {
                if (typeof v === 'number') {
                  const prevMonth =
                    i > 0
                      ? intl.formatDate(
                          historicalReturns[i - 1]['timestamp'] * 1000,
                          {
                            month: 'short',
                          }
                        )
                      : '';
                  const thisMonth = intl.formatDate(v * 1000, {
                    month: 'short',
                  });

                  // Only label the axis on the first month
                  return prevMonth !== thisMonth ? thisMonth : '';
                }

                return '';
              }}
            />
            <YAxis
              type="number"
              orientation="left"
              yAxisId={0}
              axisLine={false}
              padding={{ top: 8 }}
              tickCount={4}
              tickMargin={12}
              width={60}
              tickSize={0}
              // Changes default font color for axis
              style={{ fill: theme.palette.typography.main }}
              tickFormatter={(v: number) => `${v.toFixed(2)}%`}
            />
            <Line
              type="monotone"
              dataKey="leveragedReturn"
              stroke={theme.palette.success.main}
              strokeDasharray="3 3"
              dot={false}
              fillOpacity={1}
              fill="url(#shade)"
            />
            <Area
              type="monotone"
              dataKey="totalRate"
              stroke={theme.palette.primary.light}
              dot={false}
              fillOpacity={1}
              fill="url(#shade)"
            />
            {/* {currentBorrowRate !== undefined && (
              <ReferenceLine
                y={currentBorrowRate}
                yAxisId={0}
                stroke={theme.palette.error.main}
                strokeDasharray="3 3"
                label={(props: any) => {
                  const { offset, viewBox } = props;
                  const x = viewBox.x + viewBox.width / 2;
                  return (
                    <text offset={offset} x={x} y={viewBox.y} textAnchor="middle">
                      <tspan x={x} dy={'1.25em'} fill={theme.palette.error.main}>
                        {formatNumberAsPercent(currentBorrowRate)}
                      </tspan>
                    </text>
                  );
                }}
              />
            )} */}
            <defs>
              <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F5FFFF" stopOpacity={1} />
                <stop offset="95%" stopColor="#F6F8F8" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </TradeSummaryBox>
  );
};

export default PerformanceChart;
