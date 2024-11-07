import { isVaultTrade, TokenOption } from '@notional-finance/notionable';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { useCallback } from 'react';

export function findTradeRate(
  maturityData: TokenOption[],
  operator: 'max' | 'min'
): TokenOption | null {
  return maturityData.reduce((maxObj, currentObj) => {
    if (operator === 'max') {
      return currentObj.interestRate &&
        maxObj.interestRate &&
        currentObj.interestRate > maxObj.interestRate
        ? currentObj
        : maxObj;
    } else {
      return currentObj.interestRate &&
        maxObj.interestRate &&
        currentObj.interestRate < maxObj.interestRate
        ? currentObj
        : maxObj;
    }
  }, maturityData[0] || null);
}

export const useMaturitySelect = (category: 'Collateral' | 'Debt') => {
  const tradeContext = useCurrentTradeContext();
  const { debt, collateral } = tradeContext?.selectedTokens || {};
  const { collateral: collateralOptions, debt: debtOptions } =
    tradeContext?.computedOptions || {};
  const tradeType = tradeContext?.tradeType;

  const selectedToken = category === 'Collateral' ? collateral : debt;
  const maturityData =
    (category === 'Collateral' ? collateralOptions : debtOptions) || [];
  const isVault = isVaultTrade(tradeType);

  const onSelect = useCallback(
    (selectedId: string | undefined) => {
      if (category === 'Collateral') {
        tradeContext?.setCollateralByID(selectedId);
      } else if (isVault) {
        // Selects the matching vault collateral asset when the debt asset is selected
        tradeContext?.setVaultDebtByID(selectedId);
      } else {
        tradeContext?.setDebtByID(selectedId);
      }
    },
    [category, isVault, tradeContext]
  );

  return {
    maturityData: maturityData
      .slice()
      .sort(
        (a, b) =>
          (a.token.maturity || PRIME_CASH_VAULT_MATURITY) -
          (b.token.maturity || PRIME_CASH_VAULT_MATURITY)
      ),
    selectedfCashId: selectedToken?.id,
    defaultfCashId:
      category === 'Collateral'
        ? findTradeRate(maturityData, 'max')?.token.id
        : findTradeRate(maturityData, 'min')?.token.id,
    onSelect,
  };
};
