import { BorrowFixedSidebar } from './components';
import BorrowFixedTradeSummary from './components/borrow-fixed-trade-summary';
import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
  useYieldsReady,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const BorrowFixedContext = createTradeContext('BorrowFixed');

export const BorrowFixed = () => {
  const context = useTradeContext('BorrowFixed');
  const {
    state: { isReady, confirm, selectedNetwork },
  } = context;
  const yieldsReady = useYieldsReady(selectedNetwork);
  const featureReady = isReady && yieldsReady;

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
