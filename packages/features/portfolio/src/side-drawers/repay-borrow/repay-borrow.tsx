import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import {
  LEND_BORROW,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import {
  LendBorrowInput,
  TokenApprovalView,
  TradePropertiesGrid,
} from '@notional-finance/trade';
import { useRepayBorrow } from './use-repay-borrow';
import { messages } from '../messages';

export const RepayBorrow = () => {
  const { assetKey } = useQueryParams();
  const {
    availableTokens,
    selectedToken,
    selectedMarketKey,
    canSubmit,
    updatedAccountData,
    transactionData,
    sideDrawerInfo,
    cashOrfCash,
    updateRepayBorrowState,
  } = useRepayBorrow(assetKey);

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.REPAY_BORROW}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
    >
      {selectedToken && availableTokens.length > 0 && (
        <LendBorrowInput
          availableTokens={availableTokens}
          selectedToken={selectedToken}
          cashOrfCash={cashOrfCash}
          lendOrBorrow={LEND_BORROW.LEND}
          isRemoveAsset={true}
          selectedMarketKey={selectedMarketKey}
          onChange={({
            inputAmount,
            hasError,
            netCashAmount,
            netfCashAmount,
          }) => {
            updateRepayBorrowState({
              inputAmount,
              hasError,
              netCashAmount,
              netfCashAmount,
            });
          }}
          inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_BORROW]['inputLabel']}
        />
      )}
      <TradePropertiesGrid showBackground data={sideDrawerInfo} />
      {selectedToken && <TokenApprovalView symbol={selectedToken} />}
    </PortfolioSideDrawer>
  );
};
