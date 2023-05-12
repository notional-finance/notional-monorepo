import LendSidebar from './lend-sidebar/lend-sidebar';
import { SideBarLayout } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { updateLendState } from './store/lend-store';
import { useLendTransaction } from './store/use-lend-transaction';
import { useLend } from './store/use-lend';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendSideBarLayout = () => {
  const txnData = useLendTransaction();
  const showTransactionConfirmation = txnData ? true : false;
  const {
    markets,
    selectedToken,
    selectedMarketKey,
    tradedRate,
    fCashAmount,
    interestAmount,
  } = useLend();

  return (
    <SideBarLayout
      showTransactionConfirmation={showTransactionConfirmation}
      sideBar={<LendSidebar />}
      mainContent={
        <TradeActionSummary
          markets={markets}
          selectedToken={selectedToken}
          selectedMarketKey={selectedMarketKey}
          tradedRate={tradedRate}
          onSelectMarketKey={(marketKey: string | null) => {
            updateLendState({ selectedMarketKey: marketKey });
          }}
          tradeAction={NOTIONAL_CATEGORIES.LEND}
          fCashAmount={fCashAmount}
          interestAmount={interestAmount}
        />
      }
    />
  );
};

export default LendSideBarLayout;
