import { BorrowVariableSidebar } from './components';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { TradeActionSummary } from '@notional-finance/trade';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

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
          mainContent={<TradeActionSummary state={state} />}
        />
      </FeatureLoader>
    </BorrowVariableContext.Provider>
  );
};

export default BorrowVariable;
