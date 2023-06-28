import { useAllMarkets, useCurrency } from '@notional-finance/notionable-hooks';
import { Market, NTokenValue } from '@notional-finance/sdk/src/system';

// Returns the highest yields in each of the invest / earn categories
export function useInvestEarnYields() {
  const { maxRates } = useAllMarkets();
  const { tradableCurrencyList } = useCurrency();
  const highestLendRate = Market.formatInterestRate(Math.max(...maxRates), 2);
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
  const highestVaultApy = Market.formatInterestRate(0, 2);

  return {
    highestLendRate,
    highestNTokenRate,
    highestVaultApy,
  };
}
