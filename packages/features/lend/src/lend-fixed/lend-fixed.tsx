import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useFeatureReady,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendFixedSidebar, LendFixedTradeSummary } from './components';
import { FeatureLoader } from '@notional-finance/shared-web';
export const LendFixedContext = createTradeContext('LendFixed');

export const LendFixed = () => {
  const context = useTradeContext('LendFixed');
  const {
    state: { isReady, confirm, selectedNetwork },
  } = context;
  const featureReady = useFeatureReady(selectedNetwork, isReady);

  return (
    <LendFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={featureReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<LendFixedSidebar />}
          mainContent={<LendFixedTradeSummary />}
        />
      </FeatureLoader>
    </LendFixedContext.Provider>
  );
};

export default LendFixed;
