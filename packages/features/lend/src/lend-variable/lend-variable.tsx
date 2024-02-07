import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { LendVariableSidebar, LendVariableTradeSummary } from './components';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LendVariableContext = createTradeContext('LendVariable');

export const LendVariable = () => {
  const context = useTradeContext('LendVariable');
  const { state } = context;
  const { isReady, confirm, selectedNetwork } = state;
  const { allYields } = useAllMarkets(selectedNetwork);
  const featureReady = isReady && allYields.length > 0;

  return (
    <LendVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={featureReady}>
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
