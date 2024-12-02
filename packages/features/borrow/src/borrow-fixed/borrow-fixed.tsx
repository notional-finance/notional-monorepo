import { BorrowFixedSidebar } from './components';
import BorrowFixedTradeSummary from './components/borrow-fixed-trade-summary';
import { SideBarLayout } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';
import { observer } from 'mobx-react-lite';
export const BorrowFixed = observer(() => {
  const context = useTradeContext('BorrowFixed');
  const {
    state: { isReady, confirm },
  } = context;

  return (
    <FeatureLoader featureLoaded={isReady}>
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={<BorrowFixedSidebar />}
        mainContent={<BorrowFixedTradeSummary />}
      />
    </FeatureLoader>
  );
});

export default BorrowFixed;
