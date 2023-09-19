import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useBorrowVariableFaq } from '../hooks';
import { useInterestRateUtilizationChart } from '@notional-finance/trade';
import { HowItWorksFaq } from './how-it-works-faq';
import {
  Faq,
  FaqHeader,
  TotalBox,
  MultiDisplayChart,
  ChartContainer,
  AreaChart,
} from '@notional-finance/mui';
import { BorrowVariableContext } from '../../borrow-variable/borrow-variable';
import { TradeActionSummary, useVariableTotals } from '@notional-finance/trade';
import { useTokenHistory } from '@notional-finance/notionable-hooks';

export const BorrowVariableTradeSummary = () => {
  const theme = useTheme();
  const context = useContext(BorrowVariableContext);
  const { state } = context;
  const { deposit, debt } = state;
  const {
    areaChartData,
    chartToolTipData,
    areaChartStyles,
    chartHeaderData,
    chartInfoBoxData,
    borrowUtilization,
  } = useInterestRateUtilizationChart(deposit?.currencyId, 'borrow');
  const { faqs, faqHeaderLinks } = useBorrowVariableFaq();
  const totalsData = useVariableTotals(state);
  const { apyData, tvlData } = useTokenHistory(debt);

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
                  showCartesianGrid
                  xAxisTickFormat="date"
                  areaChartData={apyData}
                  areaLineType="linear"
                />
              </ChartContainer>
            ),
            // chartHeaderData: {
            //   textHeader: (
            //     <Box
            //       sx={{
            //         background: theme.palette.background.default,
            //         border: theme.shape.borderStandard,
            //         borderRadius: theme.shape.borderRadius(),
            //         padding: theme.spacing(0.5, 1),
            //       }}
            //     >
            //       <FormattedMessage defaultMessage={'90 Day'} />
            //     </Box>
            //   ),
            // },
          },
          {
            id: 'tvl-area-chart',
            title: 'TVL',
            Component: (
              <ChartContainer>
                <AreaChart
                  showCartesianGrid
                  xAxisTickFormat="date"
                  areaChartData={tvlData}
                  areaLineType="linear"
                />
              </ChartContainer>
            ),
            // chartHeaderData: {
            //   textHeader: (
            //     <Box
            //       sx={{
            //         background: theme.palette.background.default,
            //         border: theme.shape.borderStandard,
            //         borderRadius: theme.shape.borderRadius(),
            //         padding: theme.spacing(0.5, 1),
            //       }}
            //     >
            //       <FormattedMessage defaultMessage={'90 Day'} />
            //     </Box>
            //   ),
            // },
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
      <Faq
        sx={{ boxShadow: 'none' }}
        question={<FormattedMessage defaultMessage={'How it Works'} />}
        componentAnswer={<HowItWorksFaq />}
        questionDescription={
          <FormattedMessage
            defaultMessage={'Learn how variable rate borrowing works'}
          />
        }
      />
      {areaChartData.length > 0 && (
        <MultiDisplayChart
          chartComponents={[
            {
              id: 'area-chart',
              title: 'Borrow Utilization',
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
              chartInfoBoxData: chartInfoBoxData,
              bottomLabel: <FormattedMessage defaultMessage={'Utilization'} />,
            },
          ]}
        />
      )}
      <FaqHeader
        title={<FormattedMessage defaultMessage={'Variable Borrow FAQ'} />}
        links={faqHeaderLinks}
      />

      {faqs.map(({ question, answer, componentAnswer }, index) => (
        <Faq
          key={index}
          question={question}
          answer={answer}
          componentAnswer={componentAnswer}
          sx={{
            marginBottom: theme.spacing(2),
          }}
        />
      ))}
    </TradeActionSummary>
  );
};

export default BorrowVariableTradeSummary;
