import React from 'react';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  CurrencyInput,
  CurrencyInputHandle,
  CurrencyInputStyleProps,
  InputLabel,
} from '@notional-finance/mui';
import { useEffect } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useLendBorrowInput } from './use-lend-borrow-input';
import { Box } from '@mui/material';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';

interface LendBorrowChange {
  selectedToken: string | null;
  inputAmount: TokenBalance | undefined;
  hasError: boolean;
  netCashAmount: TokenBalance | undefined;
  netfCashAmount: TokenBalance | undefined;
  maxBalance: TokenBalance | undefined;
  fee: TokenBalance | undefined;
}

interface LendBorrowInputProps {
  availableTokens: string[];
  selectedToken: string;
  selectedMarketKey: string | null;
  onChange: (change: LendBorrowChange) => void;
  errorMsgOverride?: MessageDescriptor | null;
  warningMsg?: React.ReactNode;
  style?: CurrencyInputStyleProps;
  inputLabel?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
}

export const LendBorrowInput = React.forwardRef<
  CurrencyInputHandle,
  LendBorrowInputProps
>(
  (
    {
      availableTokens,
      selectedToken,
      selectedMarketKey,
      onChange,
      errorMsgOverride,
      warningMsg,
      style,
      inputLabel,
      inputRef,
    },
    ref
  ) => {
    const {
      inputAmount,
      errorMsg,
      netCashAmount,
      netfCashAmount,
      maxBalance,
      maxBalanceString,
      fee,
      setInputString,
    } = useLendBorrowInput(selectedToken, selectedMarketKey);
    const error = errorMsgOverride === undefined ? errorMsg : errorMsgOverride;

    // Updates parent using typed big numbers
    useEffect(() => {
      onChange({
        selectedToken,
        inputAmount,
        hasError: !!error,
        netCashAmount,
        netfCashAmount,
        maxBalance,
        fee,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      inputAmount?.hashKey,
      selectedToken,
      error,
      maxBalance?.hashKey,
      netCashAmount?.hashKey,
      netfCashAmount?.hashKey,
      fee?.hashKey,
    ]);

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          maxValue={maxBalanceString}
          onInputChange={(input) => setInputString(input)}
          errorMsg={error && <FormattedMessage {...error} />}
          warningMsg={warningMsg}
          currencies={availableTokens}
          defaultValue={selectedToken}
          onSelectChange={(newToken) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            onChange({
              selectedToken: newToken,
              inputAmount: undefined,
              hasError: false,
              netCashAmount: undefined,
              netfCashAmount: undefined,
              maxBalance,
              fee,
            });
          }}
          style={style}
        />
      </Box>
    );
  }
);
