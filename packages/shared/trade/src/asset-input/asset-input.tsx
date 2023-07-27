import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import {
  CurrencyInput,
  CurrencyInputHandle,
  InputLabel,
  PageLoading,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { BaseContext } from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router';
import { INTERNAL_TOKEN_DECIMALS } from '@notional-finance/util';
import { useAssetInput } from './use-asset-input';

interface AssetInputProps {
  context: BaseContext;
  prefillMax?: boolean;
  debtOrCollateral: 'Debt' | 'Collateral';
  newRoute?: (newToken: string | null) => string;
  warningMsg?: React.ReactNode;
  inputLabel?: MessageDescriptor;
  errorMsgOverride?: MessageDescriptor;
  inputRef: React.RefObject<CurrencyInputHandle>;
}

/**
 * Use this component whenever taking a deposit from the account's wallet,
 * it will handle proper parsing, balance checks, and max input amounts.
 * Token approvals will be handled by the token-approval-view
 */
export const AssetInput = React.forwardRef<
  CurrencyInputHandle,
  AssetInputProps
>(
  (
    {
      context,
      newRoute,
      warningMsg,
      inputLabel,
      inputRef,
      errorMsgOverride,
      debtOrCollateral,
      prefillMax,
    },
    ref
  ) => {
    const history = useHistory();
    const [hasUserTouched, setHasUserTouched] = useState(false);
    const {
      state: {
        debt,
        collateral,
        availableCollateralTokens,
        availableDebtTokens,
        calculateError,
      },
      updateState,
    } = useContext(context);
    const selectedToken = debtOrCollateral === 'Debt' ? debt : collateral;
    let availableTokens =
      debtOrCollateral === 'Debt'
        ? availableDebtTokens
        : availableCollateralTokens;
    if (availableTokens?.length === 0 && selectedToken)
      availableTokens = [selectedToken];

    const {
      inputAmount,
      maxBalanceString,
      errorMsg,
      setInputString,
    } = useAssetInput(selectedToken, debtOrCollateral === 'Debt');

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
      updateState(
        debtOrCollateral === 'Debt'
          ? { debtBalance: inputAmount }
          : { collateralBalance: inputAmount }
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateState, inputAmount?.hashKey]);

    if (!availableTokens || !selectedToken) return <PageLoading />;

    return (
      <Box>
        <InputLabel inputLabel={inputLabel} />
        <CurrencyInput
          ref={ref}
          placeholder="0.00000000"
          decimals={INTERNAL_TOKEN_DECIMALS}
          maxValue={maxBalanceString}
          onInputChange={(input) => {
            setInputString(input);
            setHasUserTouched(true);
          }}
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
          currencies={availableTokens.map((t) => t.symbol)}
          defaultValue={selectedToken.symbol}
          onSelectChange={(newToken: string | null) => {
            // Always clear the input string when we change tokens
            inputRef.current?.setInputOverride('');
            if (newToken !== selectedToken.symbol && newRoute)
              history.push(newRoute(newToken));
          }}
          style={{
            landingPage: false,
          }}
        />
      </Box>
    );
  }
);
