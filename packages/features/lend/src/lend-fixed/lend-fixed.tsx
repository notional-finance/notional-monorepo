import { SideBarLayout } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { LendFixedSidebar } from './components';
import LendFixedTradeSummary from './components/lend-fixed-trade-summary';
import { FeatureLoader } from '@notional-finance/shared-web';
import { observer } from 'mobx-react-lite';

export const LendFixed = observer(() => {
  const context = useTradeContext('LendFixed');
  const isReady = context.tradeModel?.isReady;
  const confirm = context.tradeModel?.confirm;

  return (
    <FeatureLoader featureLoaded={isReady}>
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={<LendFixedSidebar />}
        mainContent={<LendFixedTradeSummary />}
      />
    </FeatureLoader>
  );
});

export default LendFixed;
