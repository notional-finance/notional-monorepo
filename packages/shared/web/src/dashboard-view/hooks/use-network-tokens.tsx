import { getNetworkModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

export const useNetworkTokens = (
  network: Network | undefined,
  tokenType: string,
  options?: {
    isBorrow?: boolean;
  }
) => {
  const model = getNetworkModel(network);
  const yieldData = model.getTokensByType(tokenType).map((t) => {
    return {
      token: t,
      apy: model.getSpotAPY(t.id),
      tvl: model.getTVL(t),
      liquidity: model.getLiquidity(t),
      underlying: t.underlying ? model.getTokenByID(t.underlying) : undefined,
      collateralFactor: model.getDebtOrCollateralFactor(
        t,
        options?.isBorrow ?? false
      ),
    };
  });

  return yieldData;
};

export const useLeveragedNTokens = (network: Network | undefined) => {
  const model = getNetworkModel(network);
  const yieldData = model.getTokensByType('nToken').map((t) => {
    const debtTokens = model.getDefaultLeveragedNTokenAPYs(t);
    const leveragedNTokenData = debtTokens.reduce((max, current) => {
      return current?.apy?.totalAPY &&
        max?.apy?.totalAPY &&
        current.apy.totalAPY > max.apy.totalAPY
        ? current
        : max;
    }, debtTokens[0]);

    return {
      token: t,
      apy: leveragedNTokenData?.apy,
      tvl: model.getTVL(t),
      liquidity: model.getLiquidity(t),
      underlying: t.underlying ? model.getTokenByID(t.underlying) : undefined,
      debtToken: leveragedNTokenData?.debtToken,
      collateralFactor: model.getDebtOrCollateralFactor(t, false),
    };
  });
  return yieldData;
};
