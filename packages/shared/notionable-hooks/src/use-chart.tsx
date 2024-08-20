import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  SECONDS_IN_DAY,
  getNowSeconds,
  leveragedYield,
  floorToMidnight,
} from '@notional-finance/util';
import { useAccountDefinition } from './use-account';
import { useMemo } from 'react';
import { useAnalyticsReady, useAppContext } from './use-notional';
import { useAppState } from './use-app-state';

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
  const isReady = useAnalyticsReady(token?.network);
  const { apyData, tvlData } = useMemo(() => {
    const apyData =
      token && isReady
        ? Registry.getAnalyticsRegistry().getHistoricalAPY(token)
        : undefined;
    const tvlData =
      token && isReady
        ? Registry.getAnalyticsRegistry().getPriceHistory(token)
        : undefined;
    return { apyData, tvlData };
  }, [token, isReady]);

  return {
    apyData: fillChartDaily(apyData || [], { totalAPY: 0 }),
    tvlData: fillChartDaily(
      tvlData?.map(({ timestamp, tvlUSD }) => ({
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
  const isReady = useAnalyticsReady(token?.network);
  if (!token || !isReady) return [];
  const analytics = Registry.getAnalyticsRegistry();
  const primeDebt = Registry.getTokenRegistry().getPrimeDebt(
    token.network,
    token.currencyId
  );
  const tokenData = analytics.getHistoricalAPY(token);
  const primeBorrow = isPrimeBorrow
    ? analytics.getHistoricalAPY(primeDebt)
    : undefined;

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
        borrowRate,
        leveragedReturn: leveragedYield(totalAPY, borrowRate, leverageRatio),
      };
    }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    { strategyReturn: 0, leveragedReturn: undefined, borrowRate: undefined }
  );
}

export function useDepositValue(
  token: TokenDefinition | undefined,
  isPrimeBorrow: boolean,
  currentBorrowRate: number | undefined,
  leverageRatio: number | null | undefined,
  leveragedLendFixedRate: number | undefined,
  dataPoints = 90
) {
  const data = useLeveragedPerformance(
    token,
    isPrimeBorrow,
    currentBorrowRate,
    leverageRatio,
    leveragedLendFixedRate
  );

  return (
    data.length > dataPoints ? data.slice(data.length - dataPoints) : data
  ).reduce((acc, d, i) => {
    const vaultShareMultiple =
      i === 0
        ? 1
        : acc[i - 1].vaultShareMultiple *
          (1 + (d.strategyReturn || 0) / 100) ** (1 / 365);
    const borrowRateMultiple =
      i === 0
        ? 1
        : acc[i - 1].borrowRateMultiple *
          (1 + (d.borrowRate || 0) / 100) ** (1 / 365);

    acc.push({
      timestamp: d.timestamp,
      vaultShareMultiple,
      borrowRateMultiple,
      area:
        100 *
        (vaultShareMultiple +
          (vaultShareMultiple - borrowRateMultiple) * (leverageRatio || 0)),
    });
    return acc;
  }, [] as { timestamp: number; vaultShareMultiple: number; borrowRateMultiple: number; area: number }[]);
}

export function useAssetPriceHistory(token: TokenDefinition | undefined) {
  const isReady = useAnalyticsReady(token?.network);
  if (!token || !isReady) return [];
  const data = Registry.getAnalyticsRegistry().getPriceHistory(token);

  const chart = fillChartDaily(
    data.map((d) => ({
      timestamp: d.timestamp,
      assetPrice: d.priceInUnderlying?.toFloat() || 0,
    })),
    { assetPrice: 0 }
  );

  // Remove the last element of the chart if it is empty, can happen when the
  // subgraph is trailing on the latest update.
  if (chart.length && chart[chart.length - 1].assetPrice === 0) {
    chart.pop();
  }

  return chart;
}

export function useTotalHolders(token: TokenDefinition | undefined) {
  const isReady = useAnalyticsReady(token?.network);
  const {
    appState: { activeAccounts },
  } = useAppContext();

  return isReady && token && activeAccounts && activeAccounts[token.network]
    ? activeAccounts[token.network][`${token.tokenType}:${token.currencyId}`] ||
        0
    : undefined;
}

export function useAccountHistoryChart(
  network: Network | undefined,
  startTime: number,
  endTime: number,
  tickSizeInSeconds: number
) {
  const account = useAccountDefinition(network);
  const { baseCurrency } = useAppState();

  return useMemo(() => {
    if (!account) return undefined;
    // These are sorted ascending by default
    const allHistoricalSnapshots = account?.historicalBalances || [];

    const base = Registry.getTokenRegistry().getTokenBySymbol(
      Network.all,
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
              }, new Map<string, (typeof allHistoricalSnapshots)[number]>())
              .values()
          ).filter(({ balance }) => !balance.isZero());

          const assets = snapshotsAtTime
            ?.filter(
              ({ balance }) =>
                !(
                  balance.tokenType === 'VaultDebt' ||
                  balance.unwrapVaultToken().token.isFCashDebt === true ||
                  balance.unwrapVaultToken().tokenType === 'PrimeDebt' ||
                  balance.isNegative()
                )
            )
            .reduce((t, b) => {
              return t.add(
                b.balance
                  .unwrapVaultToken()
                  .toUnderlying()
                  .toFiat(baseCurrency, floorToMidnight(end))
              );
            }, TokenBalance.zero(base));

          const debts = snapshotsAtTime
            ?.filter(
              ({ balance }) =>
                balance.tokenType === 'VaultDebt' ||
                balance.unwrapVaultToken().token.isFCashDebt === true ||
                balance.unwrapVaultToken().tokenType === 'PrimeDebt' ||
                balance.isNegative()
            )
            .reduce((t, b) => {
              return t.add(
                b.balance
                  .unwrapVaultToken()
                  .toUnderlying()
                  .toFiat(baseCurrency, floorToMidnight(end))
              );
            }, TokenBalance.zero(base));

          return {
            timestamp: start,
            assets,
            debts,
            netWorth: assets.sub(debts),
          };
        });
    } catch (e) {
      return undefined;
    }
  }, [account, baseCurrency, endTime, startTime, tickSizeInSeconds]);
}
