import { useParams } from 'react-router-dom';
import LendSidebar from './lend-sidebar/lend-sidebar';
import { SideBarLayout } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import { useEffect } from 'react';
import { updateLendState } from './store/lend-store';
import { useLend } from './store/use-lend';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendFeatureShell = () => {
  const { currency } = useParams<Record<string, string>>();
  const {
    markets,
    selectedToken,
    selectedMarketKey,
    tradedRate,
    fCashAmount,
    interestAmount,
  } = useLend();

  useEffect(() => {
    if (currency)
      updateLendState({ selectedToken: currency, selectedMarketKey: '' });
  }, [currency]);

  return (
    <SideBarLayout
      mobileHeader
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

export default LendFeatureShell;
