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
import { useFiat } from './use-user-settings';
import { useMemo } from 'react';
import { useAnalyticsReady, useNotionalContext } from './use-notional';

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
    apyData: fillChartDaily(
      apyData?.map(({ timestamp, totalAPY }) => ({
        timestamp,
        area: totalAPY,
      })) || [],
      { area: 0 }
    ),
    apyIncentiveData: fillChartDaily(
      apyData?.map(
        ({
          timestamp,
          totalAPY,
          nTokenFeeRate,
          nTokenIncentiveRate,
          nTokenBlendedInterestRate,
          nTokenSecondaryIncentiveRate,
        }) => ({
          timestamp,
          totalAPY,
          noteApy: nTokenIncentiveRate,
          arbApy: nTokenSecondaryIncentiveRate,
          organicApy: nTokenBlendedInterestRate + nTokenFeeRate,
        })
      ) || [],
      { totalAPY: 0, noteApy: 0, arbApy: 0, organicApy: 0 }
    ),
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
    { strategyReturn: 0, leveragedReturn: undefined, borrowRate: undefined }
  );
}

export function useDepositValue(
  token: TokenDefinition | undefined,
  isPrimeBorrow: boolean,
  currentBorrowRate: number | undefined,
  leverageRatio: number | null | undefined,
  leveragedLendFixedRate: number | undefined
) {
  const data = useLeveragedPerformance(
    token,
    isPrimeBorrow,
    currentBorrowRate,
    leverageRatio,
    leveragedLendFixedRate
  );

  return data.reduce((acc, d, i) => {
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
      multiple:
        100 *
        (vaultShareMultiple +
          (vaultShareMultiple - borrowRateMultiple) * (leverageRatio || 0)),
    });
    return acc;
  }, [] as { timestamp: number; vaultShareMultiple: number; borrowRateMultiple: number; multiple: number }[]);
}

export function useAssetPriceHistory(token: TokenDefinition | undefined) {
  const isReady = useAnalyticsReady(token?.network);
  if (!token || !isReady) return [];
  const data = Registry.getAnalyticsRegistry().getPriceHistory(token);

  return fillChartDaily(
    data.map((d) => ({
      timestamp: d.timestamp,
      assetPrice: d.priceInUnderlying?.toFloat() || 0,
    })),
    { assetPrice: 0 }
  );
}

export function useTotalHolders(token: TokenDefinition | undefined) {
  const isReady = useAnalyticsReady(token?.network);
  const {
    globalState: { activeAccounts },
  } = useNotionalContext();

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
  const baseCurrency = useFiat();
  if (!account) return undefined;

  const allHistoricalSnapshots =
    account?.balanceStatement
      ?.flatMap((b) => b.historicalSnapshots)
      .sort((a, b) => a.timestamp - b.timestamp) || [];

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
            }, new Map<string, typeof allHistoricalSnapshots[number]>())
            .values()
        );

        const assets = snapshotsAtTime
          ?.filter(
            ({ balance }) =>
              !(
                balance.unwrapVaultToken().token.isFCashDebt === true ||
                balance.unwrapVaultToken().tokenType === 'PrimeDebt' ||
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
              balance.unwrapVaultToken().tokenType === 'PrimeDebt' ||
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
