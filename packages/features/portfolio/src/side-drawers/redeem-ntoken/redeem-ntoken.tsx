import { TradePropertiesGrid } from '@notional-finance/trade';
import { useQueryParams } from '@notional-finance/utils';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { useRedeemNToken } from './use-redeem-ntoken';
import { BaseContext } from '@notional-finance/notionable-hooks';

export const RedeemNToken = () => {
  const { sideDrawerKey } = useParams<PortfolioParams>();
  const { symbol } = useQueryParams();
  const action = sideDrawerKey ?? PORTFOLIO_ACTIONS.REDEEM_NTOKEN;
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
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
      context={undefined as unknown as BaseContext}
      action={action}
      updatedAccountData={updatedAccountData}
      transactionData={transactionData}
      canSubmit={canSubmit}
    >
      {/* {selectedToken && (
        <AccountWithdrawInput
          withdrawType={WITHDRAW_TYPE.REDEEM_TO_CASH}
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
      )} */}
      <TradePropertiesGrid data={sidebarInfo} showBackground />
    </PortfolioSideDrawer>
  );
};
