import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendFixedSidebar } from './components';
import LendFixedTradeSummary from './components/lend-fixed-trade-summary';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LendFixedContext = createTradeContext('LendFixed');
export const LendFixed = () => {
  const context = useTradeContext('LendFixed');
  const {
    state: { isReady, confirm },
  } = context;

  return (
    <LendFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
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
