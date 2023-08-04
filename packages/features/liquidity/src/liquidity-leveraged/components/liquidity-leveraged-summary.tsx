import { Box, useTheme } from '@mui/material';
import {
  TradeActionHeader,
  TradeActionTitle,
  TradeSummaryContainer,
  FaqHeader,
  Faq,
} from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { MobileTradeActionSummary } from '@notional-finance/trade';
import { useLiquidityFaq } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { useContext } from 'react';
import { LeveragedLiquidityContext } from '../liquidity-leveraged';
import { HowItWorksFaq } from './how-it-works-faq';
import { NTokenPriceExposure } from './ntoken-price-exposure';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const context = useContext(LeveragedLiquidityContext);
  const {
    state: { collateral, selectedDepositToken },
  } = context;
  const tokenSymbol = selectedDepositToken || '';
  const { faqs, faqHeaderLinks } = useLiquidityFaq(tokenSymbol);
  const totalYield = 0;
  const blendedYield = 0;
  const incentiveYield = 0;

  return (
    <>
      <TradeSummaryContainer>
        <Box sx={{ marginLeft: theme.spacing(2) }}>
          <TradeActionHeader
            token={collateral?.symbol || ''}
            actionText={<FormattedMessage defaultMessage={'Mint'} />}
          />

          <TradeActionTitle
            value={0}
            valueSuffix="%"
            title={<FormattedMessage defaultMessage="Total APY" />}
          />
        </Box>
        <Box marginBottom={theme.spacing(5)}>
          <NTokenPriceExposure state={context.state} />
        </Box>
        <Faq
          question={<FormattedMessage defaultMessage={'How it Works'} />}
          componentAnswer={<HowItWorksFaq tokenSymbol={tokenSymbol} />}
          questionDescription={
            <FormattedMessage
              defaultMessage={
                'Learn how n{tokenSymbol} works and what it does.'
              }
              values={{
                tokenSymbol,
              }}
            />
          }
        />
        <Box
          sx={{
            marginTop: theme.spacing(5),
          }}
        >
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
      </TradeSummaryContainer>
      <MobileTradeActionSummary
        tradeAction={NOTIONAL_CATEGORIES.PROVIDE_LIQUIDITY}
        selectedToken={collateral?.symbol || ''}
        dataPointOne={blendedYield}
        dataPointOneSuffix="% APY"
        dataPointTwo={incentiveYield}
        dataPointTwoSuffix="% APY"
        fixedAPY={totalYield}
      />
    </>
  );
};

export default LiquidityLeveragedSummary;
