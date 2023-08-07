import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useHistory } from 'react-router';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import { useAssetInput } from './use-asset-input';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { formatTokenType } from '@notional-finance/helpers';
import { TokenBalance } from '@notional-finance/core-entities';

interface AssetInputProps {
  context: BaseTradeContext;
  prefillMax?: boolean;
  deleverage?: {
    isPrimaryInput: boolean;
    setPrimaryInput: (input: 'Debt' | 'Collateral') => void;
  };
  debtOrCollateral: 'Debt' | 'Collateral';
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  label?: React.ReactNode;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
}

/**
 * Use this component whenever taking a deposit from the account's wallet,
 * it will handle proper parsing, balance checks, and max input amounts.
 * Token approvals will be handled by the token-approval-view
 */
export const AssetInput = React.forwardRef<
  CurrencyInputHandle,
  AssetInputProps
>(
  (
    {
      context,
      newRoute,
      warningMsg,
      // Manual label override required for deleverage labels
      label,
      inputLabel,
      inputRef,
      errorMsgOverride,
      debtOrCollateral,
      prefillMax,
      deleverage,
    },
    ref
  ) => {
    const history = useHistory();
    const [hasUserTouched, setHasUserTouched] = useState(false);
    const {
      state: {
        debt,
        collateral,
        availableCollateralTokens,
        availableDebtTokens,
        calculateError,
        debtBalance,
        collateralBalance,
      },
      updateState,
    } = context;
    const selectedToken = debtOrCollateral === 'Debt' ? debt : collateral;
    const computedBalance =
      debtOrCollateral === 'Debt' ? debtBalance : collateralBalance;
    let availableTokens =
      debtOrCollateral === 'Debt'
        ? availableDebtTokens
        : availableCollateralTokens;
    if (availableTokens?.length === 0 && selectedToken)
      availableTokens = [selectedToken];

    const { inputAmount, maxBalanceString, errorMsg, setInputString } =
      useAssetInput(selectedToken, debtOrCollateral === 'Debt');

    useEffect(() => {
      if (
        prefillMax &&
        maxBalanceString &&
        inputAmount === undefined &&
        !hasUserTouched
      ) {
        inputRef.current?.setInputOverride(maxBalanceString);
      }
    }, [inputRef, maxBalanceString, prefillMax, inputAmount, hasUserTouched]);

    const updateBalances = useCallback(
      (
        inputAmount: TokenBalance | undefined,
        computedBalance: TokenBalance | undefined
      ) => {
        if (deleverage?.isPrimaryInput === true && collateral && debt) {
          // In here, this input is the "primary". Only update the state if the
          // amounts are actually different or else we get a infinite loop
          if (
            (inputAmount === undefined && computedBalance === undefined) ||
            (inputAmount && computedBalance && inputAmount.eq(computedBalance))
          )
            return;
          updateState(
            debtOrCollateral === 'Debt'
              ? {
                  debtBalance: inputAmount,
                  collateralBalance: TokenBalance.zero(collateral),
                }
              : {
                  collateralBalance: inputAmount,
                  debtBalance: TokenBalance.zero(debt),
                }
          );
        } else if (deleverage === undefined) {
          updateState(
            debtOrCollateral === 'Debt'
              ? { debtBalance: inputAmount }
              : { collateralBalance: inputAmount }
          );
        }
      },
      [deleverage, debtOrCollateral, debt, collateral, updateState]
    );

    useEffect(() => {
      updateBalances(inputAmount, computedBalance);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateBalances, inputAmount?.hashKey, computedBalance?.hashKey]);

    useEffect(() => {
      // If the input control is no longer the primary, it will just mirror
      // the computed amount without firing updates.
      if (deleverage?.isPrimaryInput === false) {
        setHasUserTouched(false);
        const newStringValue =
          computedBalance?.isZero() || computedBalance === undefined
            ? ''
            : computedBalance.abs().toExactString();

        if (inputRef.current?.getInputValue() !== newStringValue) {
          inputRef.current?.setInputOverride(newStringValue, false);
        }
      }
    }, [deleverage, computedBalance, inputRef]);

    const currencies = useMemo(() => {
      return availableTokens?.map((t) => formatTokenType(t).title) || [];
    }, [availableTokens]);

    const onInputChange = useCallback(
      (input: string) => {
        setInputString(input);
        setHasUserTouched(true);

        // Signifies that this input control will now "take over" and no longer
        // mirror the computed balance.
        if (deleverage) deleverage?.setPrimaryInput(debtOrCollateral);
      },
      [deleverage, debtOrCollateral, setInputString]
    );

    if (!availableTokens) return <PageLoading />;

    // TODO: need to change the dropdown in here...
    return (
      <Box>
        {label ? label : <InputLabel inputLabel={inputLabel} />}
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          maxValue={maxBalanceString}
          onInputChange={onInputChange}
          errorMsg={
            errorMsgOverride ? (
              <FormattedMessage {...errorMsgOverride} />
            ) : errorMsg ? (
              <FormattedMessage {...errorMsg} />
            ) : (
              calculateError
            )
          }
          warningMsg={warningMsg}
          currencies={currencies}
          defaultValue={
            selectedToken ? formatTokenType(selectedToken).title : undefined
          }
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            if (newToken !== selectedToken?.symbol && newRoute)
              history.push(newRoute(newToken));
          }}
          style={{
            landingPage: false,
          }}
        />
      </Box>
    );
  }
);
