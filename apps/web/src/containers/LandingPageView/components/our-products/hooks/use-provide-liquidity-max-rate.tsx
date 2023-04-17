import { useCurrency } from '@notional-finance/notionable-hooks';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { Market } from '@notional-finance/sdk/src/system';

interface MaxRateProvideLiquidityData {
  symbol: string;
  maxRate: string;
}

interface ProvideLiquidityMaxRate {
  maxRateProvideLiquidityData: MaxRateProvideLiquidityData;
  provideLiquidityLoading: boolean;
}

export const useProvideLiquidityMaxRate = (): ProvideLiquidityMaxRate => {
  const { tradableCurrencies } = useCurrency();
  let currentRate = 0;
  let maxRateProvideLiquidityData = {
    symbol: 'eth',
    maxRate: '0%',
  };

  [...tradableCurrencies.values()].forEach((c) => {
    const rate = NTokenValue.getNTokenBlendedYield(c.id) || 0;
    const incentiveRate = NTokenValue.getNTokenIncentiveYield(c.id) || 0;
    const totalRate = rate + incentiveRate;
    if (totalRate > currentRate) {
      currentRate = totalRate;
      maxRateProvideLiquidityData = {
        symbol: c.underlyingSymbol || c.assetSymbol,
        maxRate: Market.formatInterestRate(totalRate, 2),
      };
    }
  });

  return {
    maxRateProvideLiquidityData,
    provideLiquidityLoading: [...tradableCurrencies.values()].length === 0,
  };
};
