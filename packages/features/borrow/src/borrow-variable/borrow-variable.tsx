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
import { observer } from 'mobx-react-lite';

export const BorrowVariableContext = createTradeContext('BorrowVariable');
export const BorrowVariable = observer(() => {
  const context = useTradeContext('BorrowVariable');
  const isReady = context.tradeModel?.isReady;
  const confirm = context.tradeModel?.confirm;

  return (
    <FeatureLoader featureLoaded={isReady}>
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={<BorrowVariableSidebar />}
        mainContent={<BorrowVariableTradeSummary />}
      />
    </FeatureLoader>
  );
});

export default BorrowVariable;
