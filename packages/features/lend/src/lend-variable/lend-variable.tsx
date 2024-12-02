import { SideBarLayout } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { LendVariableSidebar, LendVariableTradeSummary } from './components';
import { FeatureLoader } from '@notional-finance/shared-web';
import { observer } from 'mobx-react-lite';

export const LendVariable = observer(() => {
  const context = useTradeContext('LendVariable');
  const isReady = context.tradeModel?.isReady || false;
  const confirm = context.tradeModel?.confirm || false;

  return (
    <FeatureLoader featureLoaded={isReady}>
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={<LendVariableSidebar />}
        mainContent={<LendVariableTradeSummary />}
      />
    </FeatureLoader>
  );
});

export default LendVariable;
