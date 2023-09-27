import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  Faq,
  FaqHeader,
  MultiDisplayChart,
  AreaChart,
  ChartContainer,
  TotalBox,
} from '@notional-finance/mui';
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
  const context = useContext(LendVariableContext);
  const { state } = context;
  const { collateral, deposit, selectedDepositToken } = state;
  const { faqs, faqHeaderLinks } = useLendVariableFaq(selectedDepositToken);
  const totalsData = useVariableTotals(state);
  const { apyData, tvlData } = useTokenHistory(collateral);
  const {
    areaChartData,
    chartToolTipData,
    areaChartStyles,
    chartHeaderData,
    borrowUtilization,
  } = useInterestRateUtilizationChart(deposit?.currencyId, 'lend');

  return (
    <TradeActionSummary state={state}>
      <MultiDisplayChart
        chartComponents={[
          {
            id: 'apy-area-chart',
            title: 'APY',
            Component: (
              <ChartContainer>
                <AreaChart
                  title="APY"
                  showCartesianGrid
                  xAxisTickFormat="date"
                  areaChartData={apyData}
                  areaLineType="linear"
                />
              </ChartContainer>
            ),
          },
          {
            id: 'tvl-area-chart',
            title: 'TVL',
            Component: (
              <ChartContainer>
                <AreaChart
                  title="TVL"
                  showCartesianGrid
                  xAxisTickFormat="date"
                  areaChartData={tvlData}
                  yAxisTickFormat="usd"
                  areaLineType="linear"
                />
              </ChartContainer>
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
        {totalsData.map(({ title, value }, index) => (
          <TotalBox title={title} value={value} key={index} />
        ))}
      </Box>
      {areaChartData.length > 0 && (
        <MultiDisplayChart
          chartComponents={[
            {
              id: 'area-chart',
              title: 'Lend Rate Utilization',
              Component: (
                <ChartContainer>
                  <AreaChart
                    showCartesianGrid
                    areaLineType="linear"
                    xAxisTickFormat="percent"
                    areaChartData={areaChartData}
                    areaChartStyles={areaChartStyles}
                    chartToolTipData={chartToolTipData}
                    referenceLineValue={borrowUtilization}
                  />
                </ChartContainer>
              ),
              chartHeaderData: chartHeaderData,
              bottomLabel: <FormattedMessage defaultMessage={'Utilization'} />,
            },
          ]}
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Variable Lend FAQ'} />}
        links={faqHeaderLinks}
      />
      {faqs.map(({ question, answer, componentAnswer }, index) => (
        <Faq
          key={index}
          question={question}
          answer={answer}
          componentAnswer={componentAnswer}
        />
      ))}
    </TradeActionSummary>
  );
};

export default LendVariableTradeSummary;
