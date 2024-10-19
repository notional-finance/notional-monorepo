import { Box } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import {
  CurrencyInput,
  ErrorMessage,
  InputLabel,
  PageLoading,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { VaultActionContext } from '../vault';
import { VaultSideDrawer } from '../components/vault-side-drawer';
import { messages } from '../messages';
import {
  useVaultMaxWithdraw,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';
import { useInputAmount } from '@notional-finance/trade/common';
import { useVaultActionErrors } from '../hooks';

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
      maxWithdraw,
      selectedNetwork,
    },
    updateState,
  } = context;
  const [inputString, setInputString] = useState('');
  const { underMinAccountBorrowError } = useVaultActionErrors();
  const primaryBorrowSymbol = deposit?.symbol;
  const isFullRepayment = postAccountRisk?.leverageRatio === null;
  const profile = useVaultPosition(selectedNetwork, vaultAddress);
  const maxWithdrawValues = useVaultMaxWithdraw(selectedNetwork, vaultAddress);

  const { inputAmount } = useInputAmount(
    selectedNetwork,
    inputString,
    primaryBorrowSymbol
  );
  useEffect(() => {
    updateState({
      depositBalance: inputAmount?.neg(),
      maxWithdraw: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateState, inputAmount?.hashKey]);

  const onMaxValue = useCallback(() => {
    if (profile && maxWithdrawValues) {
      const {
        maxWithdrawUnderlying,
        netRealizedCollateralBalance,
        netRealizedDebtBalance,
        debtFee,
        collateralFee,
      } = maxWithdrawValues;
      setCurrencyInput(maxWithdrawUnderlying.toExactString(), false);

      updateState({
        inputsSatisfied: true,
        maxWithdraw: true,
        calculationSuccess: true,
        depositBalance: maxWithdrawUnderlying.neg(),
        calculateError: undefined,
        collateralBalance: profile.vaultShares.neg(),
        debtBalance: profile.vaultDebt.neg(),
        netRealizedCollateralBalance,
        netRealizedDebtBalance,
        debtFee,
        collateralFee,
      });
    }
  }, [profile, setCurrencyInput, updateState, maxWithdrawValues]);
  const maxWithdrawUnderlying = maxWithdrawValues?.maxWithdrawUnderlying;

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
            !maxWithdraw &&
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
        {underMinAccountBorrowError && (
          <ErrorMessage
            variant={'error'}
            message={<FormattedMessage {...underMinAccountBorrowError} />}
          />
        )}
      </Box>
    </VaultSideDrawer>
  );
};
