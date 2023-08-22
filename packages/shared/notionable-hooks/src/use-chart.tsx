import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { useSelectedNetwork } from './use-notional';

export function useTokenHistory(token?: TokenDefinition) {
  const network = useSelectedNetwork();
  const data =
    network && token
      ? Registry.getAnalyticsRegistry()
          .getAssetHistory(network)
          ?.filter(({ token: t }) => t.id === token.id)
      : undefined;

  return {
    apyData:
      data?.map(({ timestamp, totalAPY }) => ({
        timestamp,
        area: totalAPY || 0,
      })) || [],
    tvlData:
      data?.map(({ timestamp, tvlUSD }) => ({
        timestamp,
        line: tvlUSD?.toFloat() || 0,
      })) || [],
  };
}
