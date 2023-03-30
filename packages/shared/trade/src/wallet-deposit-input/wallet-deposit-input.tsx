import React from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
} from '@notional-finance/mui';
import { useCurrencyData } from '@notional-finance/notionable-hooks';
import { TypedBigNumber } from '@notional-finance/sdk';
import { useEffect, useState } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useWalletDeposit } from './use-wallet-deposit';

export interface WalletDepositChange {
  selectedToken: string | null;
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  maxBalance: TypedBigNumber | undefined;
}

interface WalletDepositInputProps {
  availableTokens: string[];
  selectedToken: string;
  onChange: (change: WalletDepositChange) => void;
  maxValueOverride?: string;
  errorMsgOverride?: MessageDescriptor & { values?: Record<string, unknown> };
  inputLabel?: MessageDescriptor;
}

/**
 * Use this component whenever taking a deposit from the account's wallet,
 * it will handle proper parsing, balance checks, and max input amounts.
 * Token approvals will be handled by the token-approval-view
 */
export const WalletDepositInput = React.forwardRef<
  CurrencyInputHandle,
  WalletDepositInputProps
>(
  (
    {
      availableTokens,
      selectedToken,
      onChange,
      maxValueOverride,
      errorMsgOverride,
      inputLabel,
    },
    ref
  ) => {
    const [inputString, setInputString] = useState<string>('');
    const { decimalPlaces } = useCurrencyData(selectedToken);
    const { inputAmount, maxBalance, maxBalanceString, errorMsg } =
      useWalletDeposit(selectedToken, inputString);
    const error = errorMsgOverride || errorMsg;

    useEffect(() => {
      onChange({
        selectedToken,
        inputAmount,
        hasError: !!error,
        maxBalance,
      });
      // NOTE: all values checked via hash key
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputAmount?.hashKey, maxBalance?.hashKey, selectedToken, error]);

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          // Use 18 decimals as a the default, but that should only be temporary during page load
          decimals={decimalPlaces || 18}
          maxValue={maxValueOverride || maxBalanceString}
          onInputChange={(input) => setInputString(input)}
          errorMsg={error && <FormattedMessage {...error} />}
          currencies={availableTokens}
          defaultValue={selectedToken}
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            setInputString('');
            onChange({
              selectedToken: newToken,
              inputAmount: undefined,
              hasError: false,
              maxBalance: undefined,
            });
          }}
          style={{
            landingPage: false,
          }}
        />
      </Box>
    );
  }
);
