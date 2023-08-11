import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { useLiquidityFaq } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LeveragedLiquidityContext } from '../liquidity-leveraged';
import { HowItWorksFaq } from './how-it-works-faq';
import { NTokenPriceExposure } from './ntoken-price-exposure';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const { state } = useContext(LeveragedLiquidityContext);
  const { selectedDepositToken } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);

  return (
    <TradeActionSummary state={state}>
      <Box marginBottom={theme.spacing(5)}>
        <NTokenPriceExposure state={state} />
      </Box>
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
          title={
            <FormattedMessage defaultMessage={'Leveraged Liquidity FAQ'} />
          }
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

export default LiquidityLeveragedSummary;
