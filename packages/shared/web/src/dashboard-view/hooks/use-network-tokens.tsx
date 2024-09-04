import { getNetworkModel } from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';

export const useNetworkTokens = (
  network: Network | undefined,
  tokenType: string
) => {
  const model = getNetworkModel(network);
  const yieldData = model.getTokensByType(tokenType).map((t) => ({
    token: t,
    apy: model.getSpotAPY(t.id),
    tvl: model.getTVL(t),
    liquidity: model.getLiquidity(t),
    underlying: t.underlying ? model.getTokenByID(t.underlying) : undefined,
  }));
  return yieldData;
};
