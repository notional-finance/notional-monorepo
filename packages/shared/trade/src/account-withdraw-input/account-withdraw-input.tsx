import React from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
} from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { INTERNAL_TOKEN_DECIMAL_PLACES } from '@notional-finance/sdk/src/config/constants';
import { WITHDRAW_TYPE } from '@notional-finance/shared-config';
import { useEffect, useState } from 'react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useAccountWithdraw } from './use-account-withdraw';

interface AccountWithdrawChange {
  selectedToken: string | null;
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  netCashBalance: TypedBigNumber | undefined;
  netNTokenBalance: TypedBigNumber | undefined;
  noteIncentivesMinted: TypedBigNumber | undefined;
  redemptionFees: TypedBigNumber | undefined;
  maxAmount: TypedBigNumber | undefined;
}

interface AccountWithdrawProps {
  withdrawType: WITHDRAW_TYPE;
  availableTokens: string[];
  selectedToken: string;
  onChange: (changes: AccountWithdrawChange) => void;
  errorMsgOverride?: MessageDescriptor;
  inputLabel?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
}

export const AccountWithdrawInput = React.forwardRef<
  CurrencyInputHandle,
  AccountWithdrawProps
>(
  (
    {
      withdrawType,
      availableTokens,
      selectedToken,
      onChange,
      errorMsgOverride,
      inputLabel,
      inputRef,
    },
    ref
  ) => {
    const [inputString, setInputString] = useState<string>('');

    const {
      inputAmount,
      errorMsg,
      maxAmount,
      maxAmountString,
      netCashBalance,
      netNTokenBalance,
      noteIncentivesMinted,
      redemptionFees,
    } = useAccountWithdraw(selectedToken, withdrawType, inputString);
    const error = errorMsgOverride || errorMsg;

    useEffect(() => {
      onChange({
        selectedToken,
        inputAmount,
        hasError: !!error,
        netCashBalance,
        netNTokenBalance,
        noteIncentivesMinted,
        redemptionFees,
        maxAmount,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      inputAmount?.hashKey,
      maxAmount?.hashKey,
      selectedToken,
      error?.id,
      netCashBalance?.hashKey,
      netNTokenBalance?.hashKey,
      noteIncentivesMinted?.hashKey,
      redemptionFees?.hashKey,
      maxAmount?.hashKey,
    ]);

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          placeholder="0.00000000"
          ref={ref}
          decimals={INTERNAL_TOKEN_DECIMAL_PLACES}
          maxValue={maxAmountString}
          onInputChange={(input) => setInputString(input)}
          errorMsg={error && <FormattedMessage {...error} />}
          currencies={availableTokens}
          defaultValue={selectedToken}
          onSelectChange={(newToken: string | null) => {
            inputRef.current?.setInputOverride('');
            onChange({
              selectedToken: newToken,
              inputAmount: undefined,
              hasError: false,
              maxAmount: undefined,
              netCashBalance: undefined,
              netNTokenBalance: undefined,
              noteIncentivesMinted: undefined,
              redemptionFees: undefined,
            });
          }}
        />
      </Box>
    );
  }
);
