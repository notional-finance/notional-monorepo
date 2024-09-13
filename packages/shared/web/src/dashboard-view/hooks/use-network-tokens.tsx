import { getNetworkModel } from '@notional-finance/core-entities';
import { useCurrentNetworkStore } from '@notional-finance/notionable';
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
      debtToken: undefined,
    };
  });

  return yieldData;
};

export const useLeveragedNTokens = () => {
  const currentNetworkStore = useCurrentNetworkStore();
  const yieldData = currentNetworkStore.getTokensByType('nToken').map((t) => {
    const debtTokens = currentNetworkStore.getDefaultLeveragedNTokenAPYs(t);
    const leveragedNTokenData =
      debtTokens.length > 0
        ? debtTokens.reduce((max, current) => {
            return current?.apy?.totalAPY &&
              max?.apy?.totalAPY &&
              current.apy.totalAPY > max.apy.totalAPY
              ? current
              : max;
          }, debtTokens[0])
        : undefined;

    return {
      token: t,
      // apy: leveragedNTokenData?.apy,
      apy: currentNetworkStore.getSpotAPY(t.id),
      tvl: currentNetworkStore.getTVL(t),
      liquidity: currentNetworkStore.getLiquidity(t),
      underlying: t.underlying
        ? currentNetworkStore.getTokenByID(t.underlying)
        : undefined,
      debtToken: leveragedNTokenData?.debtToken,
      collateralFactor: currentNetworkStore.getDebtOrCollateralFactor(t, false),
    };
  });

  return yieldData;
};
