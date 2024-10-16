import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, TotalRow } from '@notional-finance/mui';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import {
  useLeveragedLiquidityFaq,
  useSummaryState,
  useTotalsData,
} from './hooks';
import { FormattedMessage } from 'react-intl';
import { useAppStore } from '@notional-finance/notionable';

export const LiquidityLeveragedSummary = () => {
  const theme = useTheme();
  const state = useSummaryState();
  const { pathname } = useLocation();
  const { baseCurrency } = useAppStore();
  const { selectedDepositToken, collateralBalance } = state;
  const tokenSymbol = selectedDepositToken || '';
  const { totalsData, liquidityYieldData } = useTotalsData(
    state,
    baseCurrency,
    collateralBalance
  );
  const { faqs, faqHeaderLinks } = useLeveragedLiquidityFaq(tokenSymbol);

  return (
    <TradeActionSummary state={state} liquidityYieldData={liquidityYieldData}>
      <PerformanceChart state={state} />
      <TotalRow totalsData={totalsData} />
      <LiquidationChart state={state} />
      <Box sx={{ marginTop: theme.spacing(5) }}>
        <FaqHeader
          title={
            <FormattedMessage defaultMessage={'Leveraged Liquidity FAQ'} />
          }
          links={faqHeaderLinks}
        />
        {faqs.map(
          (
            {
              answer,
              question,
              questionString,
              componentAnswer,
              questionDescription,
            },
            index
          ) => (
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
              questionDescription={questionDescription}
            ></Faq>
          )
        )}
      </Box>
    </TradeActionSummary>
  );
};

export default LiquidityLeveragedSummary;
