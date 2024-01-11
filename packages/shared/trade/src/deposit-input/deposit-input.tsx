import React, { useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  Caption,
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { MessageDescriptor } from 'react-intl';
import { getErrorMessages } from './get-error-messages';
import { useDepositInput } from './use-deposit-input';
import { useHistory } from 'react-router';
import {
  BaseTradeContext,
  useWalletBalances,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { WalletIcon } from '@notional-finance/icons';

interface DepositInputProps {
  context: BaseTradeContext;
  onMaxValue?: () => void;
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
  isWithdraw?: boolean;
  maxWithdraw?: TokenBalance;
  useZeroDefault?: boolean;
  showScrollPopper?: boolean;
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
      maxWithdraw,
      useZeroDefault,
      showScrollPopper,
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
        tradeType,
        selectedNetwork,
      },
      updateState,
    } = context;
    const {
      inputAmount,
      maxBalance,
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

    const balanceAndApyData = useWalletBalances(
      selectedNetwork,
      availableDepositTokens,
      tradeType
    );

    if (!availableDepositTokens || !selectedDepositToken)
      return <PageLoading />;

    const errorMessage = getErrorMessages(
      errorMsgOverride,
      errorMsg,
      calculateError
    );

    return (
      <Box sx={{ marginBottom: `${theme.spacing(4)} !important` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <InputLabel inputLabel={inputLabel} />
          {(maxWithdraw || maxBalance) && (
            <Caption sx={{ color: theme.palette.typography.main }}>
              <WalletIcon
                fill={theme.palette.typography.light}
                sx={{
                  fontSize: '12px',
                  position: 'relative',
                  top: '1px',
                  marginRight: theme.spacing(0.5),
                }}
              />
              &nbsp;
              {(
                (maxWithdraw || maxBalance) as TokenBalance
              ).toDisplayStringWithSymbol(3, true)}
            </Caption>
          )}
        </Box>
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          // Use 18 decimals as a the default, but that should only be temporary during page load
          decimals={decimalPlaces || 18}
          maxValue={onMaxValue ? undefined : maxBalanceString}
          onMaxValue={onMaxValue}
          onInputChange={(input) => setInputString(input)}
          errorMsg={errorMessage}
          warningMsg={warningMsg}
          showScrollPopper={showScrollPopper}
          options={
            balanceAndApyData?.map(({ token, content }) => ({
              token,
              content,
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
      </Box>
    );
  }
);
