import { useParams } from 'react-router-dom';
import BorrowSidebar from './borrow-sidebar/borrow-sidebar';
import { SideBarLayout } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { LEND_BORROW } from '@notional-finance/utils';
import { updateBorrowState } from './store/borrow-store';
import { useBorrow } from './store/use-borrow';
import { useEffect } from 'react';
import { useMarkets } from '@notional-finance/notionable-hooks';

export interface BorrowParams {
  currency: string;
  collateral: string;
}

export const BorrowFeatureShell = () => {
  const { currency: selectedToken } = useParams<BorrowParams>();
  const markets = useMarkets(selectedToken);
  const { selectedMarketKey, tradedRate, fCashAmount, interestAmount } = useBorrow(selectedToken);

  useEffect(() => {
    if (selectedToken) updateBorrowState({ selectedMarketKey: null });
  }, [selectedToken]);

  return (
    <SideBarLayout
      sideBar={<BorrowSidebar />}
      mainContent={
        <TradeActionSummary
          markets={markets}
          selectedToken={selectedToken}
          selectedMarketKey={selectedMarketKey}
          tradedRate={tradedRate}
          onSelectMarketKey={(selectedMarketKey) => {
            updateBorrowState({ selectedMarketKey });
          }}
          tradeAction={LEND_BORROW.BORROW}
          fCashAmount={fCashAmount}
          interestAmount={interestAmount}
        />
      }
    />
  );
};

export default BorrowFeatureShell;
