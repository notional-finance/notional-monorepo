import { FormattedMessage } from 'react-intl';
import { ReactNode } from 'react';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
// import { MobileTradeActionSummary } from './mobile-trade-action-summary';
import { messages } from './messages';

interface TradeActionSummaryProps {
  selectedToken: string | null;
  tradeAction: NOTIONAL_CATEGORIES;
  tradedRate: number | undefined;
  tradeActionTitle: ReactNode;
  children?: ReactNode | ReactNode[];
}

export function TradeActionSummary({
  selectedToken,
  tradedRate,
  tradeActionTitle,
  tradeAction,
  children,
}: TradeActionSummaryProps) {
  if (!selectedToken) return <PageLoading />;
  const fixedAPY = tradedRate ? (tradedRate * 100) / 1e9 : undefined;

  return (
    <>
      <TradeSummaryContainer>
        <div id="trade-action-view-left-content">
          <TradeActionHeader
            token={selectedToken}
            actionText={<FormattedMessage {...messages[tradeAction].title} />}
          />

          <TradeActionTitle
            value={fixedAPY}
            title={tradeActionTitle}
            valueSuffix="%"
          />
          {children}
        </div>
      </TradeSummaryContainer>
      {/* TODO: Need to decide on what data we want displayed in the component and rework it based off of that */}
      {/* <MobileTradeActionSummary
        tradeAction={tradeAction}
        selectedToken={selectedToken}
        dataPointOne={fCashAmount}
        dataPointOneSuffix={` ${selectedToken}`}
        dataPointTwo={interestAmount}
        dataPointTwoSuffix={` ${selectedToken}`}
        fixedAPY={fixedAPY}
      /> */}
    </>
  );
}

export default TradeActionSummary;
