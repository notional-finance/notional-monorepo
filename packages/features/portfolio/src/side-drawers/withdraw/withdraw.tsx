import { PageLoading, useCurrencyInputRef } from '@notional-finance/mui';
import {
  AccountWithdrawInput,
  TradePropertiesGrid,
} from '@notional-finance/trade';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { messages } from '../messages';
import { useWithdraw } from './use-withdraw';

export const Withdraw = () => {
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
    withdrawType,
    availableTokens,
    selectedToken,
    sideDrawerInfo,
    updateWithdrawState,
  } = useWithdraw();
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.WITHDRAW}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      canSubmit={canSubmit}
    >
      {selectedToken ? (
        <>
          <AccountWithdrawInput
            withdrawType={withdrawType}
            availableTokens={availableTokens}
            selectedToken={selectedToken}
            ref={currencyInputRef}
            inputRef={currencyInputRef}
            onChange={({
              inputAmount,
              hasError,
              netCashBalance,
              netNTokenBalance,
              noteIncentivesMinted,
              redemptionFees,
              selectedToken,
            }) => {
              updateWithdrawState({
                selectedToken: selectedToken || '',
                inputAmount,
                hasError,
                netCashBalance,
                netNTokenBalance,
                noteIncentivesMinted,
                redemptionFees,
              });
            }}
            inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
          />
          <TradePropertiesGrid showBackground data={sideDrawerInfo} />
        </>
      ) : (
        <PageLoading />
      )}
    </PortfolioSideDrawer>
  );
};
