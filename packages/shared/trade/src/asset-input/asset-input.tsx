import React, { useCallback, useEffect } from 'react';
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
import { useDeleverage } from './use-deleverage';

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
    const {
      state: {
        debt,
        collateral,
        availableCollateralTokens,
        availableDebtTokens,
        calculateError,
        debtBalance,
        collateralBalance,
        tradeType,
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
    if (
      selectedToken &&
      (availableTokens?.length === 0 ||
        tradeType === 'ConvertAsset' ||
        tradeType === 'RollDebt')
    )
      availableTokens = [selectedToken];

    const { inputAmount, maxBalanceString, errorMsg, setInputString } =
      useAssetInput(
        selectedToken,
        debtOrCollateral === 'Debt',
        tradeType === 'RollDebt'
      );

    const {
      hasUserTouched,
      options,
      updateBalances,
      setHasUserTouched,
      updateDeleverageToken,
    } = useDeleverage(
      availableTokens,
      deleverage,
      inputRef,
      computedBalance,
      debt,
      collateral,
      debtOrCollateral,
      updateState
    );

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

    useEffect(() => {
      updateBalances(inputAmount, computedBalance);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateBalances, inputAmount?.hashKey, computedBalance?.hashKey]);

    useEffect(() => {
      updateState({
        inputErrors: !!errorMsg || !!errorMsgOverride,
      });
    }, [updateState, errorMsg, errorMsgOverride]);

    const onInputChange = useCallback(
      (input: string) => {
        setInputString(input);
        setHasUserTouched(true);

        // Signifies that this input control will now "take over" and no longer
        // mirror the computed balance.
        if (deleverage) deleverage?.setPrimaryInput(debtOrCollateral);
      },
      [deleverage, debtOrCollateral, setInputString, setHasUserTouched]
    );

    if (!availableTokens) return <PageLoading />;

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
          options={options}
          defaultValue={selectedToken?.id || null}
          onSelectChange={(newToken: string | null) => {
            // TODO: trigger different update here for deleverage
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            if (deleverage) updateDeleverageToken(newToken);
            else if (newToken !== selectedToken?.symbol && newRoute)
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
