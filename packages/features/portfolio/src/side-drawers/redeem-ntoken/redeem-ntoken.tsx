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
import {
  Paragraph,
  ToggleSwitch,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { Box } from '@mui/material';

export const RedeemNToken = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { sideDrawerKey } = useParams<PortfolioParams>();
  const { currencyInputRef } = useCurrencyInputRef();
  const { symbol } = useQueryParams();
  const action = sideDrawerKey ?? PORTFOLIO_ACTIONS.REDEEM_NTOKEN;
  const {
    updatedAccountData,
    transactionData,
    canSubmit,
    availableTokens,
    selectedToken,
    sidebarInfo,
    acceptResiduals,
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
          withdrawType={
            acceptResiduals
              ? WITHDRAW_TYPE.REDEEM_ACCEPT_RESIDUALS
              : WITHDRAW_TYPE.REDEEM_TO_CASH
          }
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
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end',
          marginTop: '-64px',
          alignItems: 'center',
        }}
      >
        <Paragraph>Accept Residuals: </Paragraph>
        <ToggleSwitch
          isChecked={acceptResiduals}
          onToggle={(isChecked: boolean) =>
            updateRedeemNTokenState({ acceptResiduals: isChecked })
          }
        />
      </Box>
      <TradePropertiesGrid data={sidebarInfo} showBackground />
    </PortfolioSideDrawer>
  );
};
