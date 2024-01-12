import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import {
  Faq,
  FaqHeader,
  MultiDisplayChart,
  AreaChart,
  TotalBox,
} from '@notional-finance/mui';
import { useLocation } from 'react-router-dom';
import { useLendVariableFaq } from '../hooks';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import {
  TradeActionSummary,
  useVariableTotals,
  useInterestRateUtilizationChart,
} from '@notional-finance/trade';
import { useTokenHistory } from '@notional-finance/notionable-hooks';

export const LendVariableTradeSummary = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const context = useContext(LendVariableContext);
  const { state } = context;
  const { collateral, deposit, selectedDepositToken, selectedNetwork } = state;
  const { faqs, faqHeaderLinks } = useLendVariableFaq(
    selectedDepositToken,
    selectedNetwork
  );
  const totalsData = useVariableTotals(state);
  const { apyData, tvlData } = useTokenHistory(collateral);
  const {
    areaChartData,
    chartToolTipData,
    areaChartStyles,
    chartHeaderData,
    borrowUtilization,
  } = useInterestRateUtilizationChart(deposit, 'lend');

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
                title="APY"
                showCartesianGrid
                xAxisTickFormat="date"
                areaChartData={apyData}
                areaLineType="linear"
              />
            ),
          },
          {
            id: 'tvl-area-chart',
            title: 'TVL',
            hideTopGridLine: true,
            Component: (
              <AreaChart
                title="TVL"
                showCartesianGrid
                xAxisTickFormat="date"
                areaChartData={tvlData}
                yAxisTickFormat="usd"
                areaLineType="linear"
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
              title: 'Lend Rate Utilization',
              Component: (
                <AreaChart
                  showCartesianGrid
                  areaLineType="linear"
                  xAxisTickFormat="percent"
                  xAxisTickCount={12}
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
        title={<FormattedMessage defaultMessage={'Variable Lend FAQ'} />}
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
          />
        )
      )}
    </TradeActionSummary>
  );
};

export default LendVariableTradeSummary;
