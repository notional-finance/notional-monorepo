import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { useSelectedNetwork } from './use-notional';
import { floorToMidnight } from '@notional-finance/helpers';
import { SECONDS_IN_DAY, getNowSeconds } from '@notional-finance/util';

/** Ensures that chart always has default values throughout the specified range.  */
function fillChartDaily<T extends { timestamp: number }>(
  data: T[],
  defaultValues: Omit<T, 'timestamp'>
) {
  if (data.length === 0) return data;

  const startTS = floorToMidnight(
    Math.min(...data.map(({ timestamp }) => timestamp))
  );
  const endTS = floorToMidnight(getNowSeconds()) - SECONDS_IN_DAY;
  const buckets = (endTS - startTS) / SECONDS_IN_DAY;

  // This algorithm ensures that the data is sorted.
  return new Array(buckets).fill(0).map((_, i) => {
    const ts = startTS + i * SECONDS_IN_DAY;
    return (
      data.find(({ timestamp }) => timestamp === ts) || {
        ...defaultValues,
        timestamp: ts,
      }
    );
  });
}

export function useTokenHistory(token?: TokenDefinition) {
  const network = useSelectedNetwork();
  const data =
    network && token
      ? Registry.getAnalyticsRegistry()
          .getAssetHistory(network)
          ?.filter(({ token: t }) => t.id === token.id)
      : undefined;

  return {
    apyData: fillChartDaily(
      data?.map(({ timestamp, totalAPY }) => ({
        timestamp,
        area: totalAPY || 0,
      })) || [],
      { area: 0 }
    ),
    tvlData: fillChartDaily(
      data?.map(({ timestamp, tvlUSD }) => ({
        timestamp,
        line: tvlUSD?.toFloat() || 0,
      })) || [],
      { line: 0 }
    ),
  };
}

export function useLeveragedPerformance(
  token: TokenDefinition | undefined,
  isPrimeBorrow: boolean,
  currentBorrowRate: number | undefined,
  leverageRatio: number | null | undefined,
  leveragedLendFixedRate: number | undefined
) {
  const network = useSelectedNetwork();
  if (!network || !token) return [];
  const data = Registry.getAnalyticsRegistry().getAssetHistory(network);
  const primeBorrow = data?.filter(
    ({ token: t }) =>
      t.currencyId === token.currencyId && t.tokenType === 'PrimeDebt'
  );
  const tokenData = data?.filter(({ token: t }) => t.id === token.id) || [];

  return fillChartDaily(
    tokenData.map((d) => {
      const totalAPY = leveragedLendFixedRate || d.totalAPY || 0;
      const borrowRate = isPrimeBorrow
        ? primeBorrow?.find(({ timestamp }) => d.timestamp === timestamp)
            ?.totalAPY || undefined
        : currentBorrowRate;

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
    }),
    { strategyReturn: 0, leveragedReturn: undefined }
  );
}

export function useAssetPriceHistory(token: TokenDefinition | undefined) {
  const network = useSelectedNetwork();
  if (!network || !token) return [];
  const data = Registry.getAnalyticsRegistry().getAssetHistory(network);
  const tokenData = data?.filter(({ token: t }) => t.id === token.id) || [];

  return fillChartDaily(
    tokenData.map((d) => ({
      timestamp: d.timestamp,
      assetPrice: d.assetToUnderlyingExchangeRate?.toFloat() || 0,
    })),
    { assetPrice: 0 }
  );
}
