import { useAllMarkets, useCurrency } from '@notional-finance/notionable-hooks';
import { headlineApy$ } from '@notional-finance/notionable';
import { Market, NTokenValue } from '@notional-finance/sdk/src/system';
import { useObservableState } from 'observable-hooks';

// Returns the highest yields in each of the invest / earn categories
export function useInvestEarnYields() {
  const { rates } = useAllMarkets();
  const { tradableCurrencyList } = useCurrency();
  const headlineApy = useObservableState(headlineApy$, new Map<string, number | undefined>());
  const highestLendRate = Market.formatInterestRate(Math.max(...rates), 2);
  const highestNTokenRate = Market.formatInterestRate(
    Math.max(
      ...tradableCurrencyList.map(({ id }) => {
        const blendedYield = NTokenValue.getNTokenBlendedYield(id);
        const incentiveYield = NTokenValue.getNTokenIncentiveYield(id);
        return blendedYield + incentiveYield;
      })
    ),
    2
  );
  const highestVaultApy = Market.formatInterestRate(
    Math.max(...Array.from(headlineApy.values()).map((v) => v || 0)),
    2
  );

  return {
    highestLendRate,
    highestNTokenRate,
    highestVaultApy,
  };
}
