import { useTheme } from '@mui/material';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import {
  Caption,
  CurrencyInputHandle,
  H4,
  formatCurrencySelect,
} from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useDeleverage = (
  availableTokens: TokenDefinition[] | undefined,
  deleverage:
    | {
        isPrimaryInput: boolean;
        setPrimaryInput: (input: 'Debt' | 'Collateral') => void;
      }
    | undefined,
  inputRef: React.RefObject<CurrencyInputHandle>,
  computedBalance: TokenBalance | undefined,
  debt: TokenDefinition | undefined,
  collateral: TokenDefinition | undefined,
  debtOrCollateral: 'Debt' | 'Collateral',
  updateState: (args: Partial<BaseTradeState>) => void
) => {
  const theme = useTheme();
  const { account } = useAccountDefinition();
  const [hasUserTouched, setHasUserTouched] = useState(false);

  useEffect(() => {
    // If the input control is no longer the primary, it will just mirror
    // the computed amount without firing updates.
    if (deleverage?.isPrimaryInput === false) {
      setHasUserTouched(false);
      const newStringValue =
        computedBalance?.isZero() || computedBalance === undefined
          ? ''
          : computedBalance.abs().toExactString();

      if (inputRef.current?.getInputValue() !== newStringValue) {
        inputRef.current?.setInputOverride(newStringValue, false);
      }
    }
  }, [deleverage, computedBalance, inputRef]);

  const updateDeleverageToken = useCallback(
    (tokenId: string | null) => {
      updateState(
        debtOrCollateral === 'Debt'
          ? {
              debt: availableTokens?.find((t) => t.id === tokenId),
              debtBalance: undefined,
              collateralBalance: undefined,
            }
          : {
              collateral: availableTokens?.find((t) => t.id === tokenId),
              collateralBalance: undefined,
              debtBalance: undefined,
            }
      );
    },
    [availableTokens, debtOrCollateral, updateState]
  );

  const updateBalances = useCallback(
    (
      inputAmount: TokenBalance | undefined,
      computedBalance: TokenBalance | undefined
    ) => {
      if (deleverage?.isPrimaryInput === true && collateral && debt) {
        // In here, this input is the "primary". Only update the state if the
        // amounts are actually different or else we get a infinite loop
        if (
          (inputAmount === undefined && computedBalance === undefined) ||
          (inputAmount &&
            computedBalance &&
            inputAmount.abs().eq(computedBalance.abs()))
        )
          return;
        updateState(
          debtOrCollateral === 'Debt'
            ? {
                debtBalance: inputAmount,
                collateralBalance: TokenBalance.zero(collateral),
              }
            : {
                collateralBalance: inputAmount?.neg(),
                debtBalance: TokenBalance.zero(debt),
              }
        );
      } else if (deleverage === undefined) {
        updateState(
          debtOrCollateral === 'Debt'
            ? { debtBalance: inputAmount }
            : { collateralBalance: inputAmount }
        );
      }
    },
    [deleverage, debtOrCollateral, debt, collateral, updateState]
  );

  const options = useMemo(() => {
    if (deleverage) {
      return (
        availableTokens?.map((t) => {
          const balance = account?.balances.find((b) =>
            t.tokenType === 'PrimeCash'
              ? b.tokenType === 'PrimeDebt' && t.currencyId === b.currencyId
              : t.tokenType === 'PrimeDebt'
              ? b.tokenType === 'PrimeCash' && t.currencyId === b.currencyId
              : b.tokenId === t.id
          );
          const { title, titleWithMaturity } = formatTokenType(t);

          return formatCurrencySelect(
            titleWithMaturity,
            theme,
            t.id,
            <>
              <H4 error={balance?.isNegative()}>
                {balance?.toDisplayString(3, true)} {title}
              </H4>
              {balance ? (
                <Caption>
                  {balance.toFiat('USD').toDisplayStringWithSymbol(3, true)}
                </Caption>
              ) : null}
            </>
          );
        }) || []
      );
    } else {
      return (
        availableTokens?.map((t) =>
          formatCurrencySelect(formatTokenType(t).title, theme)
        ) || []
      );
    }
  }, [availableTokens, deleverage, account?.balances, theme]);

  return {
    options,
    updateBalances,
    hasUserTouched,
    setHasUserTouched,
    updateDeleverageToken,
  };
};
