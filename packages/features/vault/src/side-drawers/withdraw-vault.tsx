import { Box } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo } from 'react';
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
import { useVaultRiskProfile } from '@notional-finance/notionable-hooks';

export const WithdrawVault = () => {
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  const context = useContext(VaultActionContext);
  const {
    state: {
      priorAccountRisk,
      postAccountRisk,
      deposit,
      riskFactorLimit,
      depositBalance,
      vaultAddress,
    },
    updateState,
  } = context;
  const primaryBorrowSymbol = deposit?.symbol;
  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const priorLeverageRatio = priorAccountRisk?.leverageRatio || null;
  const profile = useVaultRiskProfile(vaultAddress);

  const maxWithdrawUnderlying = useMemo(() => {
    return profile?.maxWithdraw().toUnderlying();
  }, [profile]);

  const onMaxValue = useCallback(() => {
    if (profile && maxWithdrawUnderlying) {
      setCurrencyInput(maxWithdrawUnderlying.toExactString(), false);

      updateState({
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: undefined,
        collateralBalance: profile.vaultShares.neg(),
        debtBalance: profile.vaultDebt.neg(),
      });
    }
  }, [profile, setCurrencyInput, maxWithdrawUnderlying, updateState]);

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

  return (
    <VaultSideDrawer context={context}>
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
          onMaxValue={maxWithdrawUnderlying && onMaxValue}
          errorMsg={
            depositBalance &&
            maxWithdrawUnderlying &&
            depositBalance.abs().gt(maxWithdrawUnderlying) ? (
              <FormattedMessage
                {...messages['WithdrawVault'].aboveMaxWithdraw}
                values={{
                  maxWithdraw:
                    maxWithdrawUnderlying?.toDisplayStringWithSymbol(),
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
          options={deposit ? [{ token: deposit }] : []}
          defaultValue={deposit?.id || null}
        />
      </Box>
    </VaultSideDrawer>
  );
};
