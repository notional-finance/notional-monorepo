import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { useLiquidityFaq, useTotalsData } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LiquidityContext } from '../liquidity-variable';
import { HowItWorksFaq } from './how-it-works-faq';

export const LiquidityVariableSummary = () => {
  const theme = useTheme();
  const { state } = useContext(LiquidityContext);
  const { selectedDepositToken } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  useTotalsData();

  return (
    <TradeActionSummary state={state}>
      <Faq
        sx={{ boxShadow: 'none' }}
        question={<FormattedMessage defaultMessage={'How it Works'} />}
        componentAnswer={<HowItWorksFaq tokenSymbol={tokenSymbol} />}
        questionDescription={
          <FormattedMessage
            defaultMessage={'Learn how n{tokenSymbol} works and what it does.'}
            values={{
              tokenSymbol,
            }}
          />
        }
      />
      <Box sx={{ marginTop: theme.spacing(5) }}>
        <FaqHeader
          title={<FormattedMessage defaultMessage={'Provide Liquidity FAQ'} />}
          links={faqHeaderLinks}
        />
        {faqs.map(({ answer, question, componentAnswer }, index) => (
          <Faq
            key={index}
            question={question}
            answer={answer}
            componentAnswer={componentAnswer}
          ></Faq>
        ))}
      </Box>
    </TradeActionSummary>
  );
};

export default LiquidityVariableSummary;
