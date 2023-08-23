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

export function useLeveragedPerformance(
  token: TokenDefinition | undefined,
  isPrimeBorrow: boolean,
  fixedRate: number | undefined,
  leverageRatio: number | null | undefined
) {
  const network = useSelectedNetwork();
  if (!network || !token) return [];
  const data = Registry.getAnalyticsRegistry().getAssetHistory(network);
  const primeBorrow = data?.filter(
    ({ token: t }) =>
      t.currencyId === token.currencyId && t.tokenType === 'PrimeDebt'
  );
  const tokenData = data?.filter(({ token: t }) => t.id === token.id) || [];

  return tokenData
    .map((d) => {
      const totalAPY = d.totalAPY || 0;
      const borrowRate = isPrimeBorrow
        ? primeBorrow?.find(({ timestamp }) => d.timestamp === timestamp)
            ?.totalAPY || undefined
        : fixedRate;

      return {
        timestamp: d.timestamp,
        strategyReturn: totalAPY,
        leveragedReturn:
          borrowRate !== undefined &&
          leverageRatio !== null &&
          leverageRatio !== undefined
            ? totalAPY + (totalAPY - borrowRate) * leverageRatio
            : undefined,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}
