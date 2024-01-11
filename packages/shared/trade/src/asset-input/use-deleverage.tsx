import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { CurrencyInputHandle } from '@notional-finance/mui';
import {
  BaseTradeContext,
  usePortfolioRiskProfile,
  usePrimeTokens,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useMemo } from 'react';

export const useDeleverage = (
  context: BaseTradeContext,
  isPrimaryInput: boolean,
  inputRef: React.RefObject<CurrencyInputHandle>,
  debtOrCollateral: 'Debt' | 'Collateral'
) => {
  const {
    state: {
      debt,
      collateral,
      availableCollateralTokens,
      availableDebtTokens,
      debtBalance,
      collateralBalance,
      selectedNetwork,
    },
    updateState,
  } = context;
  const computedBalance =
    debtOrCollateral === 'Debt' ? debtBalance : collateralBalance;
  const availableTokens =
    debtOrCollateral === 'Debt'
      ? availableDebtTokens
      : availableCollateralTokens;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const { primeCash, primeDebt } = usePrimeTokens(selectedNetwork);

  useEffect(() => {
    // If the input control is no longer the primary, it will just mirror
    // the computed amount without firing updates.
    if (!isPrimaryInput) {
      const newStringValue =
        computedBalance?.isZero() || computedBalance === undefined
          ? ''
          : computedBalance.abs().toExactString();

      if (inputRef.current?.getInputValue() !== newStringValue) {
        inputRef.current?.setInputOverride(newStringValue, false);
      }
    }
  }, [isPrimaryInput, computedBalance, inputRef]);

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
      computedBalance: TokenBalance | undefined,
      _maxBalance: TokenBalance | undefined
    ) => {
      if (isPrimaryInput && collateral && debt) {
        // In here, this input is the "primary". Only update the state if the
        // amounts are actually different or else we get a infinite loop
        if (
          (inputAmount === undefined && computedBalance === undefined) ||
          (inputAmount &&
            computedBalance &&
            inputAmount.abs().eq(computedBalance.abs()))
        ) {
          return;
        }

        updateState(
          debtOrCollateral === 'Debt'
            ? {
                debtBalance: inputAmount?.neg(),
                collateralBalance: TokenBalance.zero(collateral),
              }
            : {
                collateralBalance: inputAmount,
                debtBalance: TokenBalance.zero(debt),
              }
        );
      }
    },
    [isPrimaryInput, debtOrCollateral, debt, collateral, updateState]
  );

  const options = useMemo(() => {
    return (
      availableTokens?.map((t) => {
        const balance =
          t?.tokenType === 'PrimeDebt'
            ? profile.balances
                .find(
                  (b) =>
                    b.tokenType === 'PrimeCash' && b.currencyId === t.currencyId
                )
                ?.toToken(t)
            : profile.balances.find((b) => b.tokenId === t?.id);
        let displayToken: TokenDefinition | undefined;
        // Flip the titles since this is inverted inside the calculation
        if (t.tokenType === 'PrimeDebt' && debtOrCollateral === 'Debt') {
          displayToken = primeCash.find((p) => p.currencyId === t.currencyId);
        } else if (
          t.tokenType === 'PrimeCash' &&
          debtOrCollateral === 'Collateral'
        ) {
          displayToken = primeDebt.find((p) => p.currencyId === t.currencyId);
        }

        const { title } = formatTokenType(displayToken || t);

        return {
          token: t,
          displayToken,
          content: balance
            ? {
                largeFigure: balance.toFloat(),
                largeFigureSuffix: title,
                shouldCountUp: false,
                caption: balance
                  .toFiat('USD')
                  .toDisplayStringWithSymbol(3, true),
              }
            : undefined,
        };
      }) || []
    );
  }, [availableTokens, primeCash, primeDebt, debtOrCollateral, profile]);

  return {
    options,
    updateBalances,
    updateDeleverageToken,
  };
};
