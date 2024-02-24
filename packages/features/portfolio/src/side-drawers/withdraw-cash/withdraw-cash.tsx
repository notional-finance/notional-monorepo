import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import WithdrawCashInput from './withdraw-cash-input';
import { messages } from '../messages';
import { useWithdrawCash } from './use-withdraw-cash';

export const WithdrawCash = () => {
  const { symbol } = useQueryParams();
  const {
    updateWithdrawCashState,
    canSubmit,
    updatedAccountData,
    transactionData,
  } = useWithdrawCash(symbol);

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.WITHDRAW_CASH}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
    >
      <WithdrawCashInput
        selectedToken={symbol}
        availableTokens={[symbol]}
        inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW_CASH]['inputLabel']}
        onChange={({ inputAmount, hasError, currencyId, netCashChange }) => {
          updateWithdrawCashState({
            inputAmount,
            hasError,
            currencyId,
            netCashChange,
          });
        }}
      />
    </PortfolioSideDrawer>
  );
};
