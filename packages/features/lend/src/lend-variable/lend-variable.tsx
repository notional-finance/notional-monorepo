import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendVariableSidebar, LendVariableTradeSummary } from './components';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LendVariableContext = createTradeContext('LendVariable');

export const LendVariable = () => {
  const context = useTradeContext('LendVariable');
  const { state } = context;
  const { isReady, confirm } = state;

  return (
    <LendVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendVariableSidebar />}
          mainContent={<LendVariableTradeSummary />}
        />
      </FeatureLoader>
    </LendVariableContext.Provider>
  );
};

export default LendVariable;
