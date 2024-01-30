import { BorrowFixedSidebar, BorrowFixedTradeSummary } from './components';
import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useFeatureReady,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const BorrowFixedContext = createTradeContext('BorrowFixed');

export const BorrowFixed = () => {
  const context = useTradeContext('BorrowFixed');
  const {
    state: { isReady, confirm, selectedNetwork },
  } = context;
  const featureReady = useFeatureReady(selectedNetwork, isReady);

  return (
    <BorrowFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={featureReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<BorrowFixedSidebar />}
          mainContent={<BorrowFixedTradeSummary />}
        />
      </FeatureLoader>
    </BorrowFixedContext.Provider>
  );
};

export default BorrowFixed;
