import React, { useCallback, useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import { useAssetInput } from './use-asset-input';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { CurrencySelectOption } from '@notional-finance/mui';
import { TokenBalance } from '@notional-finance/core-entities';

interface AssetInputProps {
  context: BaseTradeContext;
  prefillMax?: boolean;
  onMaxValue?: () => void;
  onBalanceChange: (
    inputAmount: TokenBalance | undefined,
    computedBalance: TokenBalance | undefined,
    maxBalance: TokenBalance | undefined
  ) => void;
  afterInputChange?: (input: string) => void;
  afterTokenChange?: (newToken: string | null) => void;
  options?: CurrencySelectOption[];
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
const AssetInput = React.forwardRef<CurrencyInputHandle, AssetInputProps>(
  (
    {
      prefillMax,
      context,
      newRoute,
      warningMsg,
      onMaxValue,
      onBalanceChange,
      afterInputChange,
      afterTokenChange,
      options,
      // Manual label override required for deleverage labels
      label,
      inputLabel,
      inputRef,
      errorMsgOverride,
      debtOrCollateral,
    },
    ref
  ) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { state, updateState } = context;
    const { calculateError } = state;
    const [hasUserTouched, setHasUserTouched] = useState(false);

    const {
      computedBalance,
      selectedToken,
      availableTokens,
      inputAmount,
      maxBalanceString,
      maxBalance,
      errorMsg,
      setInputString,
    } = useAssetInput(state, debtOrCollateral);

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
      if (inputAmount?.hashKey !== computedBalance?.hashKey) {
        onBalanceChange(inputAmount, computedBalance, maxBalance);
      }
      // Exhaustive deps is disabled since we are using hashKeys for comparison
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      updateState,
      onBalanceChange,
      inputAmount?.hashKey,
      computedBalance?.hashKey,
      maxBalance?.hashKey,
    ]);

    useEffect(() => {
      updateState({
        inputErrors: !!errorMsg || !!errorMsgOverride,
      });
    }, [updateState, errorMsg, errorMsgOverride]);

    const onInputChange = useCallback(
      (input: string) => {
        setInputString(input);
        setHasUserTouched(true);

        // Used as a hook for leverage inputs
        if (afterInputChange) afterInputChange(input);
      },
      [afterInputChange, setInputString]
    );

    if (!availableTokens) return <PageLoading />;

    return (
      <Box sx={{ marginBottom: `${theme.spacing(4)} !important` }}>
        {label ? label : <InputLabel inputLabel={inputLabel} />}
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          maxValue={onMaxValue ? undefined : maxBalanceString}
          onMaxValue={onMaxValue}
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
          options={options || availableTokens}
          defaultValue={selectedToken?.id || null}
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            if (newToken !== selectedToken?.symbol && newRoute)
              navigate(newRoute(newToken));

            if (afterTokenChange) afterTokenChange(newToken);
          }}
          style={{
            landingPage: false,
          }}
        />
      </Box>
    );
  }
);

AssetInput.displayName = 'AssetInput';
export { AssetInput };
