import React, { useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { useDepositInput } from './use-deposit-input';
import { useHistory } from 'react-router';
import TokenApprovalView from '../token-approval-view/token-approval-view';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';

interface DepositInputProps {
  context: BaseTradeContext;
  onMaxValue?: () => void;
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
  isWithdraw?: boolean;
  useZeroDefault?: boolean;
  requiredApprovalAmount?: TokenBalance;
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
      onMaxValue,
      warningMsg,
      inputLabel,
      inputRef,
      errorMsgOverride,
      isWithdraw,
      useZeroDefault,
      requiredApprovalAmount,
    },
    ref
  ) => {
    const history = useHistory();
    const theme = useTheme();
    const {
      state: {
        deposit,
        selectedDepositToken,
        availableDepositTokens,
        calculateError,
      },
      updateState,
    } = context;
    const {
      inputAmount,
      maxBalanceString,
      errorMsg,
      decimalPlaces,
      setInputString,
    } = useDepositInput(selectedDepositToken, isWithdraw, useZeroDefault);

    useEffect(() => {
      updateState({
        depositBalance: inputAmount,
        maxWithdraw: false,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateState, inputAmount?.hashKey]);

    useEffect(() => {
      updateState({
        inputErrors: !!errorMsg || !!errorMsgOverride,
      });
    }, [updateState, errorMsg, errorMsgOverride]);

    if (!availableDepositTokens || !selectedDepositToken)
      return <PageLoading />;

    return (
      <Box sx={{ marginBottom: theme.spacing(3) }}>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          // Use 18 decimals as a the default, but that should only be temporary during page load
          decimals={decimalPlaces || 18}
          maxValue={onMaxValue ? undefined : maxBalanceString}
          onMaxValue={onMaxValue}
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
          options={
            availableDepositTokens?.map((token) => ({
              token,
            })) || []
          }
          defaultValue={deposit?.id || null}
          onSelectChange={(tokenId: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            const newTokenSymbol = availableDepositTokens?.find(
              (t) => t.id === tokenId
            )?.symbol;

            if (
              newTokenSymbol &&
              newTokenSymbol !== selectedDepositToken &&
              newRoute
            ) {
              history.push(newRoute(newTokenSymbol));
            }
          }}
          style={{
            landingPage: false,
          }}
        />
        {!isWithdraw && (
          <TokenApprovalView
            symbol={selectedDepositToken}
            // NOTE: this override is used when maxRepay is selected since the input amount
            // is not changed during that interaction
            requiredAmount={requiredApprovalAmount || inputAmount}
          />
        )}
      </Box>
    );
  }
);
