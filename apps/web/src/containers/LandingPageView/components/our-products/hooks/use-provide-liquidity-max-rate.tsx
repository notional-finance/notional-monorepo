interface MaxRateProvideLiquidityData {
  symbol: string;
  maxRate: string;
}

interface ProvideLiquidityMaxRate {
  maxRateProvideLiquidityData: MaxRateProvideLiquidityData;
  provideLiquidityLoading: boolean;
}

export const useProvideLiquidityMaxRate = (): ProvideLiquidityMaxRate => {
  const maxRateProvideLiquidityData = {
    symbol: 'eth',
    maxRate: '0%',
  };

  return {
    maxRateProvideLiquidityData,
    provideLiquidityLoading: false,
  };
};
