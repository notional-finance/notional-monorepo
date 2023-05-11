import { useParams } from 'react-router-dom';
import BorrowSidebar from './borrow-sidebar/borrow-sidebar';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { updateBorrowState } from './store/borrow-store';
import { useBorrowTransaction } from './store/use-borrow-transaction';
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
  const txnData = useBorrowTransaction(selectedToken);
  const showTransactionConfirmation = txnData ? true : false;
  const { selectedMarketKey, tradedRate, fCashAmount, interestAmount } =
    useBorrow(selectedToken);

  useEffect(() => {
    if (selectedToken) updateBorrowState({ selectedMarketKey: null });
  }, [selectedToken]);

  return (
    <FeatureLoader featureLoaded={markets.length > 0}>
      <SideBarLayout
        showTransactionConfirmation={showTransactionConfirmation}
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
            tradeAction={NOTIONAL_CATEGORIES.BORROW}
            fCashAmount={fCashAmount}
            interestAmount={interestAmount}
          />
        }
      />
    </FeatureLoader>
  );
};

export default BorrowFeatureShell;
