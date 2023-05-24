import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useWalletDeposit } from './use-wallet-deposit';
import { TokenBalance } from '@notional-finance/core-entities';

export interface WalletDepositChange {
  selectedToken: string | null;
  inputAmount: TokenBalance | undefined;
  hasError: boolean;
  maxBalance: TokenBalance | undefined;
}

interface WalletDepositInputProps {
  availableTokens: string[];
  selectedToken: string;
  onChange: (change: WalletDepositChange) => void;
  maxValueOverride?: string;
  errorMsgOverride?: MessageDescriptor;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
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
      warningMsg,
      inputLabel,
      inputRef,
    },
    ref
  ) => {
    const {
      inputAmount,
      maxBalance,
      maxBalanceString,
      errorMsg,
      decimalPlaces,
      setInputString,
    } = useWalletDeposit(selectedToken);
    const error = errorMsgOverride || errorMsg;

    useEffect(() => {
      onChange({
        selectedToken,
        inputAmount,
        hasError: errorMsg !== undefined || errorMsgOverride !== undefined,
        maxBalance,
      });
      // NOTE: all values checked via hash key
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputAmount?.hashKey, maxBalance?.hashKey, selectedToken, errorMsg]);

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
          warningMsg={warningMsg}
          currencies={availableTokens}
          defaultValue={selectedToken}
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
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
