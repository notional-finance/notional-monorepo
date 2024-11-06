import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendVariableSidebar, LendVariableTradeSummary } from './components';
import { FeatureLoader } from '@notional-finance/shared-web';
import { observer } from 'mobx-react-lite';

export const LendVariableContext = createTradeContext('LendVariable');

export const LendVariable = observer(() => {
  const context = useTradeContext('LendVariable');
  const isReady = context.tradeModel?.isReady || false;
  const confirm = context.tradeModel?.confirm || false;

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
});

export default LendVariable;
