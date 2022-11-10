import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS, useQueryParams } from '@notional-finance/utils';

import { CollateralSelect, TokenApprovalView } from '@notional-finance/trade';
import { useDepositCollateral } from './use-deposit-collateral';
import { useHistory, useLocation } from 'react-router';
import { messages } from '../messages';

export const DepositCollateral = () => {
  const {
    availableTokens,
    updatedAccountData,
    transactionData,
    canSubmit,
    updateDepositCollateralState,
  } = useDepositCollateral();
  const history = useHistory();
  const { pathname } = useLocation();
  const { symbol } = useQueryParams();

  return (
    <PortfolioSideDrawer
      action={PORTFOLIO_ACTIONS.DEPOSIT}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      canSubmit={canSubmit}
    >
      <CollateralSelect
        inputLabel={messages[PORTFOLIO_ACTIONS.DEPOSIT]['inputLabel']}
        availableTokens={availableTokens}
        selectedToken={symbol || 'ETH'}
        onChange={(selectedToken, collateralAction, hasError, collateralApy, collateralSymbol) => {
          if (selectedToken !== (symbol || 'ETH')) {
            history.push(`${pathname}?symbol=${selectedToken}`);
          }
          updateDepositCollateralState({
            collateralAction,
            hasError,
            collateralApy,
            collateralSymbol,
          });
        }}
      />
      {symbol && <TokenApprovalView symbol={symbol} />}
    </PortfolioSideDrawer>
  );
};
