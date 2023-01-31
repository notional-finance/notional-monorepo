import React from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
} from '@notional-finance/mui';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { useConvertCashToNTokensInput } from './use-convert-cash-to-n-tokens';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { TypedBigNumber } from '@notional-finance/sdk';
import { useEffect, useState } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

export interface ConvertCashToNTokensInputChange {
  selectedToken: string | null;
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  maxBalance: TypedBigNumber | undefined;
}

interface ConvertCashToNTokensInputProps {
  availableTokens: string[];
  selectedToken: string;
  onChange: (change: any) => void;
  inputLabel?: MessageDescriptor;
}

export const ConvertCashToNTokensInput = React.forwardRef<
  CurrencyInputHandle,
  ConvertCashToNTokensInputProps
>(({ availableTokens, selectedToken, onChange, inputLabel }, ref) => {
  const [inputString, setInputString] = useState<string>('');

  const { inputAmount, maxValue, errorMsg, currencyId } =
    useConvertCashToNTokensInput(selectedToken, inputString);

  const error = errorMsg;

  useEffect(() => {
    if (inputAmount && currencyId) {
      onChange({
        inputAmount,
        currencyId,
        netCashChange: inputAmount.neg(),
        netNTokenChange: NTokenValue.getNTokensToMint(currencyId, inputAmount),
        hasError: !!error,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAmount?.hashKey, selectedToken, error]);

  return (
    <Box>
      <InputLabel inputLabel={inputLabel} />
      <CurrencyInput
        ref={ref}
        placeholder="0.00000000"
        decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
        maxValue={maxValue}
        onInputChange={(input) => setInputString(input)}
        errorMsg={error && <FormattedMessage {...error} />}
        currencies={availableTokens}
        defaultValue={selectedToken}
        style={{
          landingPage: false,
        }}
      />
    </Box>
  );
});

export default ConvertCashToNTokensInput;
