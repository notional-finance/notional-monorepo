import React, { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useDepositInput } from './use-deposit-input';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router';
import TokenApprovalView from '../token-approval-view/token-approval-view';

interface DepositInputProps {
  context: BaseContext;
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
  isWithdraw?: boolean;
}

/**
 * Use this component whenever taking a deposit from the account's wallet,
 * it will handle proper parsing, balance checks, and max input amounts.
 * Token approvals will be handled by the token-approval-view
 */
export const DepositInput = React.forwardRef<
  CurrencyInputHandle,
  DepositInputProps
>(
  (
    {
      context,
      newRoute,
      warningMsg,
      inputLabel,
      inputRef,
      errorMsgOverride,
      isWithdraw,
    },
    ref
  ) => {
    const history = useHistory();
    const {
      state: { selectedDepositToken, availableDepositTokens, calculateError },
      updateState,
    } = useContext(context);
    const {
      inputAmount,
      maxBalanceString,
      errorMsg,
      decimalPlaces,
      setInputString,
    } = useDepositInput(selectedDepositToken, isWithdraw);

    useEffect(() => {
      updateState({
        depositBalance: isWithdraw ? inputAmount?.neg() : inputAmount,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateState, inputAmount?.hashKey]);

    if (!availableDepositTokens || !selectedDepositToken)
      return <PageLoading />;

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          // Use 18 decimals as a the default, but that should only be temporary during page load
          decimals={decimalPlaces || 18}
          maxValue={maxBalanceString}
          onInputChange={(input) => setInputString(input)}
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
          currencies={availableDepositTokens?.map((t) => t.symbol) || []}
          defaultValue={selectedDepositToken}
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            if (newToken !== selectedDepositToken && newRoute)
              history.push(newRoute(newToken));
          }}
          style={{
            landingPage: false,
          }}
        />
        <TokenApprovalView
          symbol={selectedDepositToken}
          requiredAmount={inputAmount}
        />
      </Box>
    );
  }
);
