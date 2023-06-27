import { Box } from '@mui/material';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import {
  CurrencyInput,
  InputLabel,
  PageLoading,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import { TokenBalance } from '@notional-finance/core-entities';

export const WithdrawVault = () => {
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  const {
    state: {
      priorAccountRisk,
      postAccountRisk,
      deposit,
      riskFactorLimit,
      depositBalance,
    },
    updateState,
  } = useContext(VaultActionContext);
  const primaryBorrowSymbol = deposit?.symbol;
  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const priorLeverageRatio = priorAccountRisk?.leverageRatio || null;

  useEffect(() => {
    // Set the default leverage ratio to the prior account leverage ratio
    if (!riskFactorLimit && priorLeverageRatio !== null) {
      updateState({
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: priorLeverageRatio,
        },
      });
    }
  }, [riskFactorLimit, priorLeverageRatio, updateState]);

  if (!deposit || !primaryBorrowSymbol || priorLeverageRatio === null)
    return <PageLoading />;

  // TODO: need to figure out this value...
  const maxWithdrawAmount = TokenBalance.zero(deposit);

  return (
    <VaultSideDrawer>
      <Box>
        <InputLabel inputLabel={messages['WithdrawVault']['inputLabel']} />
        <CurrencyInput
          ref={currencyInputRef}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          onInputChange={(withdrawAmountString) => {
            try {
              updateState({
                depositBalance: TokenBalance.fromFloat(
                  withdrawAmountString,
                  deposit
                ).neg(),
                riskFactorLimit: {
                  riskFactor: 'leverageRatio',
                  limit: priorLeverageRatio,
                },
              });
            } catch (e) {
              updateState({
                depositBalance: undefined,
              });
            }
          }}
          onMaxValue={() => {
            // A risk factor of zero means fully withdrawing debt and collateral
            setCurrencyInput(maxWithdrawAmount.toExactString());

            updateState({
              depositBalance: maxWithdrawAmount.neg(),
              riskFactorLimit: {
                riskFactor: 'leverageRatio',
                limit: 0,
              },
            });
          }}
          errorMsg={
            depositBalance &&
            maxWithdrawAmount &&
            depositBalance.gt(maxWithdrawAmount) ? (
              <FormattedMessage
                {...messages['WithdrawVault'].aboveMaxWithdraw}
                values={{
                  maxWithdraw: maxWithdrawAmount?.toDisplayStringWithSymbol(),
                }}
              />
            ) : undefined
          }
          captionMsg={
            isFullRepayment && (
              <FormattedMessage
                {...messages['WithdrawVault']['fullRepaymentInfo']}
              />
            )
          }
          currencies={[primaryBorrowSymbol]}
          defaultValue={primaryBorrowSymbol}
        />
      </Box>
    </VaultSideDrawer>
  );
};
