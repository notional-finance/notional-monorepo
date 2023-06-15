import { FeatureLoader, SideBarLayout } from '@notional-finance/mui';
import {
  createBaseTradeContext,
  useBaseTradeContext,
} from '@notional-finance/notionable-hooks';
import LendVariableSidebar from '../sidebars/lend-variable-sidebar';
import { TradeActionSummary } from '@notional-finance/trade';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';

export const LendVariableContext = createBaseTradeContext('LendVariable');

export const LendVariable = () => {
  const context = useBaseTradeContext('LendVariable');
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;

  return (
    <LendVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady && !!selectedDepositToken}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendVariableSidebar />}
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
    </LendVariableContext.Provider>
  );
};

export default LendVariable;
