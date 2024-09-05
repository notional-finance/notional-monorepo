import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useBorrowVariableFaq } from '../hooks';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { useInterestRateUtilizationChart } from '@notional-finance/trade';
import {
  Faq,
  FaqHeader,
  TotalBox,
  MultiDisplayChart,
  AreaChart,
} from '@notional-finance/mui';
import { BorrowVariableContext } from '../../borrow-variable/borrow-variable';
import { TradeActionSummary, useVariableTotals } from '@notional-finance/trade';
import { useChartData } from '@notional-finance/notionable-hooks';
import { ChartType } from '@notional-finance/core-entities';

export const BorrowVariableTradeSummary = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const context = useContext(BorrowVariableContext);
  const { state } = context;
  const { deposit, debt } = state;
  const {
    areaChartData,
    chartToolTipData,
    areaChartStyles,
    chartHeaderData,
    borrowUtilization,
  } = useInterestRateUtilizationChart(deposit, 'borrow');
  const { faqs, faqHeaderLinks } = useBorrowVariableFaq();
  const totalsData = useVariableTotals(state);
  const { data: priceData } = useChartData(debt, ChartType.PRICE);
  const { data: apyData } = useChartData(debt, ChartType.APY);

  return (
    <TradeActionSummary state={state}>
      <MultiDisplayChart
        chartComponents={[
          {
            id: 'apy-area-chart',
            title: 'APY',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title={'APY'}
                showCartesianGrid
                areaDataKey="totalAPY"
                xAxisTickFormat="date"
                areaChartData={apyData?.data || []}
                areaLineType="linear"
              />
            ),
          },
          {
            id: 'tvl-area-chart',
            title: 'Total Lent',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title={'Total Lent'}
                showCartesianGrid
                xAxisTickFormat="date"
                areaDataKey="tvlUSD"
                areaChartData={priceData?.data || []}
                areaLineType="linear"
                yAxisTickFormat="usd"
              />
            ),
          },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          gap: theme.spacing(5),
          marginBottom: theme.spacing(3),
          marginTop: theme.spacing(3),
        }}
      >
        {totalsData.map(({ title, value, prefix, suffix }, index) => (
          <TotalBox
            title={title}
            value={value}
            key={index}
            prefix={prefix}
            suffix={suffix}
          />
        ))}
      </Box>
      {areaChartData.length > 0 && (
        <MultiDisplayChart
          chartComponents={[
            {
              id: 'area-chart',
              title: 'Borrow Utilization',
              hideTopGridLine: true,
              Component: (
                <AreaChart
                  showCartesianGrid
                  xAxisTickCount={12}
                  areaLineType="linear"
                  xAxisTickFormat="percent"
                  areaChartData={areaChartData}
                  areaChartStyles={areaChartStyles}
                  chartToolTipData={chartToolTipData}
                  referenceLineValue={borrowUtilization}
                />
              ),
              chartHeaderData: chartHeaderData,
            },
          ]}
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Borrowing FAQ'} />}
        links={faqHeaderLinks}
      />

      {faqs.map(
        ({ question, questionString, answer, componentAnswer }, index) => (
          <Faq
            onClick={() =>
              trackEvent(TRACKING_EVENTS.TOOL_TIP, {
                path: pathname,
                type: TRACKING_EVENTS.FAQ,
                title: questionString,
              })
            }
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
            sx={{
              marginBottom: theme.spacing(2),
            }}
          />
        )
      )}
    </TradeActionSummary>
  );
};

export default BorrowVariableTradeSummary;
