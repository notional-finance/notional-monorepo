import { FormattedMessage } from 'react-intl';
import { BorrowFixedSidebar } from './components';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { NOTIONAL_CATEGORIES } from '@notional-finance/shared-config';
import { TradeActionSummary } from '@notional-finance/trade';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';

export const BorrowFixedContext = createTradeContext('BorrowFixed');

export const BorrowFixed = () => {
  const context = useTradeContext('BorrowFixed');
  const {
    state: { isReady, confirm, selectedDepositToken },
  } = context;

  return (
    <BorrowFixedContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<BorrowFixedSidebar />}
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
    </BorrowFixedContext.Provider>
  );
};

export default BorrowFixed;
