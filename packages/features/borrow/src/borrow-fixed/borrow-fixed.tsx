import { BorrowFixedSidebar, BorrowFixedTradeSummary } from './components';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const BorrowFixedContext = createTradeContext('BorrowFixed');

export const BorrowFixed = () => {
  const context = useTradeContext('BorrowFixed');
  const {
    state: { isReady, confirm },
  } = context;

  return (
    <BorrowFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
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
