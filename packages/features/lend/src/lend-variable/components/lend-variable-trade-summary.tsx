import { useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  Faq,
  FaqHeader,
  SingleDisplayChart,
  TotalBox,
} from '@notional-finance/mui';
import { useLendVariableFaq } from '../hooks';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import { TradeActionSummary, useVariableTotals } from '@notional-finance/trade';
import { useTokenHistory } from '@notional-finance/notionable-hooks';

export const LendVariableTradeSummary = () => {
  const theme = useTheme();
  const context = useContext(LendVariableContext);
  const { state } = context;
  const { collateral } = state;
  const { faqs, faqHeaderLinks } = useLendVariableFaq(
    state.selectedDepositToken
  );
  const totalsData = useVariableTotals(state);
  const { apyData } = useTokenHistory(collateral);

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
