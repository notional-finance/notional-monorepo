import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { useSelectedNetwork } from './use-notional';
import { floorToMidnight } from '@notional-finance/helpers';
import {
  Network,
  SECONDS_IN_DAY,
  SECONDS_IN_MONTH,
  getNowSeconds,
  leveragedYield,
} from '@notional-finance/util';
import { useAccountDefinition } from './use-account';
import { useFiat } from './use-user-settings';

/** Ensures that chart always has default values throughout the specified range.  */
function fillChartDaily<T extends { timestamp: number }>(
  data: T[],
  defaultValues: Omit<T, 'timestamp'>
) {
  if (data.length === 0) return data;

  const startTS = floorToMidnight(
    Math.min(...data.map(({ timestamp }) => timestamp))
  );
  const endTS = floorToMidnight(getNowSeconds());
  const buckets = (endTS - startTS) / SECONDS_IN_DAY + 1;

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
        area: tvlUSD?.toFloat() || 0,
      })) || [],
      { area: 0 }
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
        leveragedReturn: leveragedYield(totalAPY, borrowRate, leverageRatio),
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

//TODO: Update this hook to return the total net worth in USD, total assets in USD, and total debts in USD as well as the value change percentage overtime
export function useAccountHistoryChart(
  startTime = getNowSeconds() - SECONDS_IN_MONTH,
  endTime = getNowSeconds(),
  tickSizeInSeconds = SECONDS_IN_DAY
) {
  const { account } = useAccountDefinition();
  const baseCurrency = useFiat();
  if (!account) return undefined;

  const allHistoricalSnapshots =
    account?.balanceStatement
      ?.flatMap((b) => b.historicalSnapshots)
      .sort((a, b) => a.timestamp - b.timestamp) || [];

  const base = Registry.getTokenRegistry().getTokenBySymbol(
    Network.All,
    baseCurrency
  );

  // Bucket the start and end time ranges
  const numBuckets = Math.ceil((endTime - startTime) / tickSizeInSeconds);
  try {
    return new Array(numBuckets)
      .fill(0)
      .map((_, i) => {
        const start = startTime + i * tickSizeInSeconds;
        return { start, end: start + tickSizeInSeconds };
      })
      .map(({ start, end }) => {
        const snapshotsAtTime = Array.from(
          allHistoricalSnapshots
            .filter(({ timestamp }) => timestamp < end)
            .reduce((t, s) => {
              // This will always set the token id key to the latest snapshot value, preserving
              // the previous snapshot value if there was no update in this time block
              t.set(s.balance.tokenId, s);
              return t;
            }, new Map<string, typeof allHistoricalSnapshots[number]>())
            .values()
        );

        const assets = snapshotsAtTime
          ?.filter(
            ({ balance }) =>
              !(
                balance.unwrapVaultToken().token.isFCashDebt === true ||
                balance.tokenType === 'PrimeDebt' ||
                balance.isNegative()
              )
          )
          .reduce((t, b) => {
            return t.add(b.balance.toFiat(baseCurrency, floorToMidnight(end)));
          }, TokenBalance.zero(base));

        const debts = snapshotsAtTime
          ?.filter(
            ({ balance }) =>
              balance.unwrapVaultToken().token.isFCashDebt === true ||
              balance.tokenType === 'PrimeDebt' ||
              balance.isNegative()
          )
          .reduce((t, b) => {
            return t.sub(b.balance.toFiat(baseCurrency, floorToMidnight(end)));
          }, TokenBalance.zero(base));

        return { timestamp: start, assets, debts, netWorth: assets.sub(debts) };
      });
  } catch (e) {
    return undefined;
  }
}
