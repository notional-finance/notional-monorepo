import {
  BorrowVariableSidebar,
  BorrowVariableTradeSummary,
} from './components';
import { SideBarLayout } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { FeatureLoader } from '@notional-finance/shared-web';

export const BorrowVariableContext = createTradeContext('BorrowVariable');

export const BorrowVariable = () => {
  const context = useTradeContext('BorrowVariable');
  const { state } = context;
  const { isReady, confirm } = state;

  return (
    <BorrowVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<BorrowVariableSidebar />}
          mainContent={<BorrowVariableTradeSummary />}
        />
      </FeatureLoader>
    </BorrowVariableContext.Provider>
  );
};

export default BorrowVariable;
