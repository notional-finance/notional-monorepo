import React from 'react';
import { LEND_BORROW } from '@notional-finance/shared-config';
import {
  CurrencyInput,
  CurrencyInputHandle,
  CurrencyInputStyleProps,
  InputLabel,
} from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { useEffect, useState } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useLendBorrowInput } from './use-lend-borrow-input';
import { Box } from '@mui/material';

export type CashOrFCash = 'Cash' | 'fCash';

interface LendBorrowChange {
  selectedToken: string | null;
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  netCashAmount: TypedBigNumber | undefined;
  netfCashAmount: TypedBigNumber | undefined;
  maxAmount: TypedBigNumber | undefined;
}

interface LendBorrowInputProps {
  availableTokens: string[];
  selectedToken: string;
  cashOrfCash: CashOrFCash;
  lendOrBorrow: LEND_BORROW;
  isRemoveAsset: boolean;
  selectedMarketKey: string | null;
  onChange: (change: LendBorrowChange) => void;
  selectedAssetKey?: string;
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
      cashOrfCash,
      lendOrBorrow,
      isRemoveAsset,
      selectedMarketKey,
      onChange,
      selectedAssetKey,
      errorMsgOverride,
      warningMsg,
      style,
      inputLabel,
      inputRef,
    },
    ref
  ) => {
    const [inputString, setInputString] = useState<string>('');
    const {
      inputAmount,
      errorMsg,
      netCashAmount,
      netfCashAmount,
      maxAmount,
      maxAmountString,
    } = useLendBorrowInput(
      selectedToken,
      cashOrfCash,
      lendOrBorrow,
      isRemoveAsset,
      selectedMarketKey,
      inputString,
      selectedAssetKey
    );
    const error = errorMsgOverride === undefined ? errorMsg : errorMsgOverride;

    // Updates parent using typed big numbers
    useEffect(() => {
      onChange({
        selectedToken,
        inputAmount,
        hasError: !!error,
        netCashAmount,
        netfCashAmount,
        maxAmount,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      inputAmount?.hashKey,
      selectedToken,
      error,
      maxAmount?.hashKey,
      netCashAmount?.hashKey,
      netfCashAmount?.hashKey,
    ]);

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
          maxValue={maxAmountString}
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
              maxAmount,
            });
          }}
          style={style}
        />
      </Box>
    );
  }
);
