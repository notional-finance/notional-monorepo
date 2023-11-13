import { isVaultTrade } from '@notional-finance/notionable';
import {
  BaseTradeContext,
  MaturityData,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';
import { useCallback, useMemo } from 'react';

export function findTradeRate(
  maturityData: MaturityData[],
  operator: 'max' | 'min'
): MaturityData | null {
  return maturityData.reduce((maxObj, currentObj) => {
    if (operator === 'max') {
      return currentObj.tradeRate &&
        maxObj.tradeRate &&
        currentObj.tradeRate > maxObj.tradeRate
        ? currentObj
        : maxObj;
    } else {
      return currentObj.tradeRate &&
        maxObj.tradeRate &&
        currentObj.tradeRate < maxObj.tradeRate
        ? currentObj
        : maxObj;
    }
  }, maturityData[0] || null);
}

export const useMaturitySelect = (
  category: 'Collateral' | 'Debt',
  context: BaseTradeContext
) => {
  const {
    state: {
      availableCollateralTokens,
      availableDebtTokens,
      collateral,
      debt,
      collateralOptions,
      debtOptions,
      tradeType,
      deposit,
    },
    updateState,
  } = context;
  const selectedToken = category === 'Collateral' ? collateral : debt;
  const options = category === 'Collateral' ? collateralOptions : debtOptions;
  const tokens =
    category === 'Collateral' ? availableCollateralTokens : availableDebtTokens;
  const isVault = isVaultTrade(tradeType);
  // Need to check if deposit is set to resolve some race conditions here
  const spotMaturityData = useSpotMaturityData(deposit ? tokens : []);

  const maturityData: MaturityData[] = useMemo(() => {
    return (
      options?.map((o) => {
        return {
          token: o.token,
          tokenId: o.token.id,
          tradeRate: o.interestRate,
          maturity: o.token.maturity || 0,
        };
      }) || spotMaturityData
    );
  }, [options, spotMaturityData]);

  const onSelect = useCallback(
    (selectedId: string | undefined) => {
      if (category === 'Collateral') {
        const collateral = availableCollateralTokens?.find(
          (t) => t.id === selectedId
        );
        updateState({ collateral });
      } else if (isVault) {
        // Selects the matching vault collateral asset when the debt asset is selected
        const debt = availableDebtTokens?.find((t) => t.id === selectedId);
        const collateral = availableCollateralTokens?.find(
          (t) => t.maturity === debt?.maturity
        );
        updateState({ debt, collateral });
      } else {
        const debt = availableDebtTokens?.find((t) => t.id === selectedId);
        updateState({ debt });
      }
    },
    [
      availableCollateralTokens,
      availableDebtTokens,
      updateState,
      category,
      isVault,
    ]
  );

  return {
    maturityData: maturityData.sort((a, b) => a.maturity - b.maturity),
    selectedfCashId: selectedToken?.id,
    defaultfCashId:
      category === 'Collateral'
        ? findTradeRate(maturityData, 'max')?.tokenId
        : findTradeRate(maturityData, 'min')?.tokenId,
    onSelect,
  };
};
