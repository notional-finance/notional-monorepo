import { convertRateToFloat } from '@notional-finance/helpers';
import {
  TradeContext,
  useFCashMarket,
} from '@notional-finance/notionable-hooks';
import { formatInterestRate } from '@notional-finance/util';
import { useCallback, useContext } from 'react';

export const useMaturitySelect = (
  category: 'Collateral' | 'Debt',
  context: TradeContext
) => {
  const {
    state: {
      availableCollateralTokens,
      availableDebtTokens,
      collateral,
      debt,
      collateralOptions,
      debtOptions,
      deposit,
      depositBalance,
    },
    updateState,
  } = useContext(context);
  const tokens =
    category === 'Collateral' ? availableCollateralTokens : availableDebtTokens;
  const selectedToken = category === 'Collateral' ? collateral : debt;
  const options = category === 'Collateral' ? collateralOptions : debtOptions;
  const currencyId =
    deposit?.currencyId ||
    selectedToken?.currencyId ||
    options?.find((_) => !!_)?.currencyId;

  const fCashMarket = useFCashMarket(currencyId);
  const spotRates = fCashMarket?.getSpotInterestRates();

  const maturityData =
    fCashMarket && spotRates && tokens
      ? tokens
          .filter((t) => t.tokenType === 'fCash' && t.currencyId === currencyId)
          .sort((t) => t.maturity || 0)
          .map((t, i) => {
            const option = options?.find((_, index) => index === i);
            let tradeRate: number | undefined;
            if (depositBalance && option) {
              tradeRate = fCashMarket.getImpliedInterestRate(
                depositBalance,
                option
              );
            } else if (option === null) {
              // This signifies an error
              tradeRate = undefined;
            } else {
              tradeRate = spotRates[i];
            }

            return {
              fCashId: t.id,
              tradeRate: tradeRate ? convertRateToFloat(tradeRate) : undefined,
              maturity: t.maturity || 0,
              hasLiquidity: true,
              tradeRateString: tradeRate ? formatInterestRate(tradeRate) : '',
            };
          })
      : [];

  const onSelect = useCallback(
    (selectedId: string | undefined) => {
      if (category === 'Collateral') {
        const selectedCollateralToken = availableCollateralTokens?.find(
          (t) => t.id === selectedId
        )?.symbol;
        updateState({ selectedCollateralToken });
      } else {
        const selectedDebtToken = availableDebtTokens?.find(
          (t) => t.id === selectedId
        )?.symbol;
        updateState({ selectedDebtToken });
      }
    },
    [availableCollateralTokens, availableDebtTokens, updateState, category]
  );

  return { maturityData, selectedfCashId: selectedToken?.id, onSelect };
};
