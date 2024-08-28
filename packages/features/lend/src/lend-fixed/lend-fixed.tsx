import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useYieldsReady,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { LendFixedSidebar } from './components';
import LendFixedTradeSummary from './components/lend-fixed-trade-summary';
import { FeatureLoader } from '@notional-finance/shared-web';

export const LendFixedContext = createTradeContext('LendFixed');
export const LendFixed = () => {
  const context = useTradeContext('LendFixed');
  const {
    state: { isReady, confirm, selectedNetwork },
  } = context;
  const yieldsReady = useYieldsReady(selectedNetwork);
  const featureReady = isReady && yieldsReady;

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
