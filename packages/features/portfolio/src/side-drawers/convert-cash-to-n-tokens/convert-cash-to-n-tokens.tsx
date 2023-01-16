import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useQueryParams } from '@notional-finance/utils';
import {
  LEND_BORROW,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import { ConvertCashToNTokensInput } from './convert-cash-to-n-tokens-input';
import { useConvertCashToNTokens } from './use-convert-cash-to-n-tokens';
import { messages } from '../messages';

export const ConvertCashToNTokens = () => {
  const { symbol } = useQueryParams();
  const {
    updateCashToNTokensState,
    canSubmit,
    updatedAccountData,
    transactionData,
  } = useConvertCashToNTokens(symbol);

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.CONVERT_CASH}
      canSubmit={canSubmit}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
    >
      <ConvertCashToNTokensInput
        selectedToken={symbol}
        availableTokens={[symbol]}
        inputLabel={messages[PORTFOLIO_ACTIONS.CONVERT_CASH]['inputLabel']}
        onChange={({
          inputAmount,
          hasError,
          currencyId,
          netCashChange,
          netNTokenChange,
        }) => {
          updateCashToNTokensState({
            inputAmount,
            hasError,
            currencyId,
            netCashChange,
            netNTokenChange,
          });
        }}
      />
    </PortfolioSideDrawer>
  );
};
