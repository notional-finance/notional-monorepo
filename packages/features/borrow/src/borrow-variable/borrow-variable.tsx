import { FormattedMessage } from 'react-intl';
import { BorrowVariableSidebar } from './components';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { TradeActionSummary } from '@notional-finance/trade';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const BorrowVariableContext = createTradeContext('BorrowVariable');

export const BorrowVariable = () => {
  const context = useTradeContext('BorrowVariable');
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;

  return (
    <BorrowVariableContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<BorrowVariableSidebar />}
          mainContent={
            <TradeActionSummary
              selectedToken={selectedDepositToken || null}
              tradedRate={undefined}
              tradeActionTitle={
                <FormattedMessage defaultMessage={'4.431% Variable APY'} />
              }
              tradeAction={NOTIONAL_CATEGORIES.BORROW}
            ></TradeActionSummary>
          }
        />
      </FeatureLoader>
    </BorrowVariableContext.Provider>
  );
};

export default BorrowVariable;
