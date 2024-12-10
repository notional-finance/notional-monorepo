import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, TotalRow } from '@notional-finance/mui';
import {
  LeveragedLiquidityLiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { useLeveragedLiquidityFaq, useTotalsData } from './hooks';
import { FormattedMessage } from 'react-intl';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

export const LiquidityLeveragedSummary = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { pathname } = useLocation();
  const selectedDepositToken = trade?.selectedTokens?.deposit.symbol || '';
  const { currentHoldings } = trade?.getLeveragedNTokenPositions() || {};
  const { totalsData } = useTotalsData();
  const { faqs, faqHeaderLinks } =
    useLeveragedLiquidityFaq(selectedDepositToken);

  return (
    <TradeActionSummary>
      <PerformanceChart
        currentPositionFactors={{
          borrowRate: currentHoldings?.borrowAPY,
          isPrimeBorrow:
            currentHoldings?.debt.balance.token.maturity === undefined,
          leverageRatio: currentHoldings?.leverageRatio,
        }}
      />
      <TotalRow totalsData={totalsData} />
      <LeveragedLiquidityLiquidationChart />
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
});

export default LiquidityLeveragedSummary;
