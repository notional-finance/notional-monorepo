import {
  AccountWithdrawInput,
  TradePropertiesGrid,
} from '@notional-finance/trade';
import { useQueryParams } from '@notional-finance/utils';
import {
  PORTFOLIO_ACTIONS,
  WITHDRAW_TYPE,
} from '@notional-finance/shared-config';
import { useEffect } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { messages } from '../messages';
import { useRedeemNToken } from './use-redeem-ntoken';

export const RedeemNToken = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { sideDrawerKey } = useParams<PortfolioParams>();
  const { symbol } = useQueryParams();
  const action = sideDrawerKey ?? PORTFOLIO_ACTIONS.REDEEM_NTOKEN;
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
    availableTokens,
    selectedToken,
    sidebarInfo,
    updateRedeemNTokenState,
  } = useRedeemNToken(action);

  useEffect(() => {
    if (symbol && selectedToken !== symbol) {
      updateRedeemNTokenState({ selectedToken: symbol });
    }
  }, [symbol, selectedToken, updateRedeemNTokenState]);

  return (
    <PortfolioSideDrawer
      action={action}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      canSubmit={canSubmit}
    >
      {selectedToken && (
        <AccountWithdrawInput
          withdrawType={WITHDRAW_TYPE.REDEEM_TO_CASH}
          availableTokens={availableTokens}
          selectedToken={selectedToken}
          onChange={({
            inputAmount,
            hasError,
            netCashBalance,
            netNTokenBalance,
            noteIncentivesMinted,
            redemptionFees,
            selectedToken,
          }) => {
            if (selectedToken !== symbol) {
              history.push(`${pathname}?symbol=${selectedToken}`);
            }

            updateRedeemNTokenState({
              selectedToken: selectedToken || '',
              inputAmount,
              hasError,
              netCashBalance,
              netNTokenBalance,
              noteIncentivesMinted,
              redemptionFees,
            });
          }}
          inputLabel={messages[action]['inputLabel']}
        />
      )}
      <TradePropertiesGrid data={sidebarInfo} showBackground />
    </PortfolioSideDrawer>
  );
};
