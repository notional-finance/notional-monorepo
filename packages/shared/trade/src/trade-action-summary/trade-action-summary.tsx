import { ReactNode } from 'react';
import {
  TradeActionHeader,
  PageLoading,
  TradeSummaryContainer,
  TradeActionTitle,
} from '@notional-finance/mui';
// import { MobileTradeActionSummary } from './mobile-trade-action-summary';

interface TradeActionSummaryProps {
  selectedToken: string | null;
  tradedRate: number | undefined;
  tradeActionTitle: ReactNode;
  tradeActionHeader: ReactNode;
  children?: ReactNode | ReactNode[];
}

export function TradeActionSummary({
  selectedToken,
  tradedRate,
  tradeActionTitle,
  tradeActionHeader,
  children,
}: TradeActionSummaryProps) {
  if (!selectedToken) return <PageLoading />;

  return (
    <>
      <TradeSummaryContainer>
        <div id="trade-action-view-left-content">
          <TradeActionHeader
            token={selectedToken}
            actionText={tradeActionHeader}
          />

          <TradeActionTitle
            value={tradedRate}
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
