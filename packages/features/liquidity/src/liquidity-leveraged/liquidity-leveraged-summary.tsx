import { Box, useTheme } from '@mui/material';
import { FaqHeader, Faq, TotalRow } from '@notional-finance/mui';
import {
  LeveragedLiquidityLiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation, useParams } from 'react-router-dom';
import { useLeveragedLiquidityFaq, useTotalsData } from './hooks';
import { FormattedMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  usePortfolioLiquidationPrices,
} from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from '@notional-finance/core-entities';

export const LiquidityLeveragedSummary = observer(() => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const { pathname } = useLocation();
  const selectedDepositToken = trade?.selectedTokens?.deposit.symbol || '';
  const { currentHoldings, currentAPYFactors } =
    trade?.getLeveragedNTokenPositions() || {};
  const { totalsData } = useTotalsData();
  const { faqs, faqHeaderLinks } =
    useLeveragedLiquidityFaq(selectedDepositToken);
  const currentLiquidationPrice = usePortfolioLiquidationPrices(
    trade?.selectedNetwork
  )?.find((p) => p.asset === currentHoldings?.asset.balance.token.id);
  const { action } = useParams<{
    action?: string;
  }>();

  return (
    <TradeActionSummary
      isLeveragedNToken
      collateralToken={currentHoldings?.asset.balance.token}
      currentPositionAPYFactors={
        action === 'Manage' ? currentAPYFactors : undefined
      }
    >
      <PerformanceChart
        currentPositionFactors={{
          collateralToken: currentHoldings?.asset.balance.token,
          borrowRate: currentHoldings?.borrowAPY,
          isPrimeBorrow:
            currentHoldings?.debt.balance.token.maturity === undefined,
          leverageRatio: currentHoldings?.leverageRatio,
        }}
      />
      <TotalRow totalsData={totalsData} />
      <LeveragedLiquidityLiquidationChart
        collateralToken={currentHoldings?.asset.balance.token}
        currentLiquidationPrice={
          currentLiquidationPrice?.threshold as TokenBalance | undefined
        }
      />
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
