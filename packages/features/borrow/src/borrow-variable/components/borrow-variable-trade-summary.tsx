import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  useBorrowVariableFaq,
  useInterestRateUtilizationChart,
} from '../hooks';
import { HowItWorksFaq } from './how-it-works-faq';
import {
  Faq,
  FaqHeader,
  TotalBox,
  SingleDisplayChart,
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
    legendData,
    chartInfoBoxData,
    borrowUtilization,
  } = useInterestRateUtilizationChart(deposit?.currencyId);
  const { faqs, faqHeaderLinks } = useBorrowVariableFaq();
  const totalsData = useVariableTotals(state);
  const { apyData } = useTokenHistory(debt);

  return (
    <TradeActionSummary state={state}>
      <SingleDisplayChart
        areaChartData={apyData}
        xAxisTickFormat="date"
        chartType="area"
        showCartesianGrid
        areaLineType="linear"
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
        <SingleDisplayChart
          areaChartData={areaChartData}
          chartToolTipData={chartToolTipData}
          referenceLineValue={borrowUtilization}
          legendData={legendData}
          chartType="area"
          xAxisTickFormat="percent"
          bottomLabel={<FormattedMessage defaultMessage={'Utilization'} />}
          chartInfoBoxData={chartInfoBoxData}
          showCartesianGrid
          areaLineType="linear"
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
