import { Box } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import {
  CurrencyInput,
  InputLabel,
  PageLoading,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { VaultActionContext } from '../vault';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import { useVaultRiskProfile } from '@notional-finance/notionable-hooks';
import { useInputAmount } from '@notional-finance/trade/common';

export const WithdrawVault = () => {
  const { setCurrencyInput, currencyInputRef } = useCurrencyInputRef();
  const context = useContext(VaultActionContext);
  const {
    state: {
      postAccountRisk,
      deposit,
      depositBalance,
      vaultAddress,
      calculateError,
    },
    updateState,
  } = context;
  const [inputString, setInputString] = useState('');
  const primaryBorrowSymbol = deposit?.symbol;
  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const profile = useVaultRiskProfile(vaultAddress);

  const { inputAmount } = useInputAmount(inputString, primaryBorrowSymbol);
  useEffect(() => {
    updateState({
      depositBalance: inputAmount?.neg(),
      maxWithdraw: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState, inputAmount?.hashKey]);

  const maxWithdrawUnderlying = useMemo(() => {
    return profile?.maxWithdraw().toUnderlying();
  }, [profile]);

  const onMaxValue = useCallback(() => {
    if (profile && maxWithdrawUnderlying) {
      setCurrencyInput(maxWithdrawUnderlying.toExactString(), false);

      updateState({
        inputsSatisfied: true,
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxWithdrawUnderlying.neg(),
        calculateError: undefined,
        collateralBalance: profile.vaultShares.neg(),
        debtBalance: profile.vaultDebt.neg(),
      });
    }
  }, [profile, setCurrencyInput, maxWithdrawUnderlying, updateState]);

  if (!deposit || !primaryBorrowSymbol) return <PageLoading />;

  return (
    <VaultSideDrawer context={context}>
      <Box>
        <InputLabel inputLabel={messages['WithdrawVault']['inputLabel']} />
        <CurrencyInput
          ref={currencyInputRef}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          onInputChange={(withdrawAmountString) => {
            setInputString(withdrawAmountString);
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
            ) : (
              calculateError
            )
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
