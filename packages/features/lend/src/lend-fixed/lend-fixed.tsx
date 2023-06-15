import { FeatureLoader, SideBarLayout } from '@notional-finance/mui';
import {
  createBaseTradeContext,
  useBaseTradeContext,
} from '@notional-finance/notionable-hooks';
import LendSidebar from '../sidebars/lend-fixed-sidebar';
import { TradeActionSummary } from '@notional-finance/trade';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendFixedContext = createBaseTradeContext('LendFixed');

export const LendFixed = () => {
  const context = useBaseTradeContext('LendFixed');
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;

  return (
    <LendFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady && !!selectedDepositToken}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendSidebar />}
          mainContent={
            <TradeActionSummary
              markets={[]}
              selectedToken={selectedDepositToken || null}
              selectedMarketKey={null}
              tradedRate={undefined}
              onSelectMarketKey={(_marketKey: string | null) => {
                // updateLendState({ selectedMarketKey: marketKey });
              }}
              tradeAction={NOTIONAL_CATEGORIES.LEND}
              fCashAmount={undefined}
              interestAmount={undefined}
            />
          }
        />
      </FeatureLoader>
    </LendFixedContext.Provider>
  );
};

export default LendFixed;
