import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { CurrencyInputHandle } from '@notional-finance/mui';
import {
  useAppStore,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import {
  usePortfolioRiskProfile,
  usePrimeTokens,
} from '@notional-finance/notionable-hooks';
import { useCallback, useEffect, useMemo } from 'react';

export const useDeleverage = (
  isPrimaryInput: boolean,
  inputRef: React.RefObject<CurrencyInputHandle>,
  debtOrCollateral: 'Debt' | 'Collateral'
) => {
  const trade = useCurrentTradeContext();
  const selectedNetwork = trade?.selectedNetwork;
  const { debt, collateral } = trade?.selectedTokens ?? {};
  const { debt: availableDebtTokens, collateral: availableCollateralTokens } =
    trade?.availableTokens ?? {};
  const debtBalance = trade?.debtBalance;
  const collateralBalance = trade?.collateralBalance;

  const { baseCurrency } = useAppStore();
  const computedBalance =
    debtOrCollateral === 'Debt' ? debtBalance : collateralBalance;
  const availableTokens =
    debtOrCollateral === 'Debt'
      ? availableDebtTokens
      : availableCollateralTokens;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const primeTokens = usePrimeTokens();

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
      if (debtOrCollateral === 'Debt') {
        trade?.setDebtByID(tokenId ?? undefined, false);
      } else {
        trade?.setCollateralByID(tokenId ?? undefined, false);
      }
    },
    [debtOrCollateral, trade]
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

        if (debtOrCollateral === 'Debt') {
          trade?.setDebtAndCollateralBalance(
            inputAmount?.neg(),
            TokenBalance.zero(collateral)
          );
        } else {
          trade?.setDebtAndCollateralBalance(
            TokenBalance.zero(debt),
            inputAmount
          );
        }
      }
    },
    [isPrimaryInput, debtOrCollateral, debt, collateral, trade]
  );

  const options = useMemo(() => {
    return (
      availableTokens?.map((t) => {
        const balance =
          t?.tokenType === 'PrimeDebt'
            ? profile?.balances
                .find(
                  (b) =>
                    b.tokenType === 'PrimeCash' && b.currencyId === t.currencyId
                )
                ?.toToken(t)
            : profile?.balances.find((b) => b.tokenId === t?.id);
        let displayToken: TokenDefinition | undefined;
        // Flip the titles since this is inverted inside the calculation
        if (t.tokenType === 'PrimeDebt' && debtOrCollateral === 'Debt') {
          displayToken = primeTokens?.primeCash.find(
            (p) => p.currencyId === t.currencyId
          );
        } else if (
          t.tokenType === 'PrimeCash' &&
          debtOrCollateral === 'Collateral'
        ) {
          displayToken = primeTokens?.primeDebt.find(
            (p) => p.currencyId === t.currencyId
          );
        }

        return {
          token: t,
          displayToken,
          content: balance
            ? {
                largeFigure: balance.toFloat(),
                shouldCountUp: false,
                caption: balance.toFiat(baseCurrency).toDisplayString(2),
              }
            : undefined,
        };
      }) || []
    );
  }, [availableTokens, primeTokens, debtOrCollateral, profile, baseCurrency]);

  return {
    options,
    updateBalances,
    updateDeleverageToken,
  };
};
