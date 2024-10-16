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
import { useChartData } from '@notional-finance/notionable-hooks';
import { ChartType } from '@notional-finance/core-entities';

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
  const { data: tvlData } = useChartData(collateral, ChartType.PRICE);
  const { data: apyData } = useChartData(collateral, ChartType.APY);
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
                title="Total Lent"
                showCartesianGrid
                xAxisTickFormat="date"
                areaDataKey="tvlUSD"
                areaChartData={tvlData?.data || []}
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
        {totalsData.map(
          ({ title, value, prefix, suffix, Icon, decimals }, index) => (
            <TotalBox
              title={title}
              value={value}
              key={index}
              prefix={prefix}
              suffix={suffix}
              Icon={Icon}
              decimals={decimals}
            />
          )
        )}
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
                  referenceLineValue={[
                    {
                      value: borrowUtilization,
                      color: theme.palette.background.accentPaper,
                    },
                  ]}
                />
              ),
              chartHeaderData: chartHeaderData,
            },
          ]}
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Lending FAQ'} />}
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
