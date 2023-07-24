import { MaturityData, isVaultTrade } from '@notional-finance/notionable';
import {
  BaseContext,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';
import { RATE_PRECISION, formatInterestRate } from '@notional-finance/util';
import { useCallback, useContext } from 'react';

export const useMaturitySelect = (
  category: 'Collateral' | 'Debt',
  context: BaseContext
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
  } = useContext(context);
  const selectedToken = category === 'Collateral' ? collateral : debt;
  const options = category === 'Collateral' ? collateralOptions : debtOptions;
  const tokens =
    category === 'Collateral' ? availableCollateralTokens : availableDebtTokens;
  const isVault = isVaultTrade(tradeType);
  // Need to check if deposit is set to resolve some race conditions here
  const spotMaturityData = useSpotMaturityData(deposit, deposit ? tokens : []);

  const maturityData: MaturityData[] =
    options?.map((o) => {
      return {
        fCashId: o.token.id,
        tradeRate: o.interestRate,
        maturity: o.token.maturity || 0,
        hasLiquidity: true,
        tradeRateString: formatInterestRate(o.interestRate),
      };
    }) || spotMaturityData;

  const onSelect = useCallback(
    (selectedId: string | undefined) => {
      if (category === 'Collateral') {
        const selectedCollateralToken = availableCollateralTokens?.find(
          (t) => t.id === selectedId
        )?.symbol;
        updateState({ selectedCollateralToken });
      } else if (isVault) {
        // Selects the matching vault collateral asset when the debt asset is selected
        const selectedDebt = availableDebtTokens?.find(
          (t) => t.id === selectedId
        );
        const selectedCollateral = availableCollateralTokens?.find(
          (t) => t.maturity === selectedDebt?.maturity
        );
        updateState({
          selectedDebtToken: selectedDebt?.symbol,
          selectedCollateralToken: selectedCollateral?.symbol,
        });
      } else {
        const selectedDebtToken = availableDebtTokens?.find(
          (t) => t.id === selectedId
        )?.symbol;
        updateState({ selectedDebtToken });
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
    onSelect,
  };
};
