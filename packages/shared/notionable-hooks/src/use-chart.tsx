import {
  ChartType,
  getNetworkModel,
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
import { useEffect, useMemo } from 'react';
import {
  useAppStore,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
import { useObserver } from 'mobx-react-lite';

export const useChartData = (
  token: TokenDefinition | undefined,
  chartType: ChartType
) => {
  const tokenId =
    token?.tokenType === 'VaultShare' ? token.vaultAddress : token?.id;
  const network = token?.network;

  const d = useObserver(() => {
    if (!tokenId)
      return {
        data: undefined,
        isLoading: true,
        error: undefined,
      };

    const model = getNetworkModel(network);
    return model.getTimeSeries(tokenId, chartType);
  });

  useEffect(() => {
    if (d.data === undefined && tokenId && network) {
      const asyncFetch = async () => {
        const model = getNetworkModel(network);
        await model.fetchTimeSeriesData(tokenId, chartType);
      };
      asyncFetch();
    }
  }, [d.data, tokenId, network, chartType]);

  return d;
};

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

export function useLeveragedPerformance(
  token: TokenDefinition | undefined,
  isPrimeBorrow: boolean,
  currentBorrowRate: number | undefined,
  leverageRatio: number | null | undefined,
  leveragedLendFixedRate: number | undefined
) {
  const currentNetworkStore = useCurrentNetworkStore();
  const primeDebt = currentNetworkStore.getPrimeDebt(token?.currencyId);
  const { data: tokenAPY } = useChartData(token, ChartType.APY);
  const { data: primeBorrowAPY } = useChartData(primeDebt, ChartType.APY);

  if (!token) return [];
  return fillChartDaily(
    tokenAPY?.data?.map((d) => {
      const totalAPY = leveragedLendFixedRate || d['totalAPY'] || 0;
      const borrowRate = isPrimeBorrow
        ? primeBorrowAPY?.data?.find(
            ({ timestamp }) => d.timestamp === timestamp
          )?.['totalAPY'] || undefined
        : currentBorrowRate;

      return {
        timestamp: d.timestamp,
        strategyReturn: totalAPY,
        borrowRate,
        leveragedReturn: leveragedYield(totalAPY, borrowRate, leverageRatio),
      };
    }) || [],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    { strategyReturn: 0, leveragedReturn: undefined, borrowRate: undefined }
  );
}

export function calculateDepositValue(
  leverageRatio: number | null | undefined,
  data: {
    timestamp: number;
    strategyReturn: number;
    borrowRate: number | undefined;
    leveragedReturn: number | undefined;
  }[],
  dataPoints = 90
) {
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
  const { data: tokenPrice } = useChartData(token, ChartType.PRICE);

  const chart = fillChartDaily(
    tokenPrice?.data?.map((d) => ({
      timestamp: d.timestamp,
      assetPrice: d['priceToUnderlying'] || 0,
    })) || [],
    { assetPrice: 0 }
  );

  // Remove the last element of the chart if it is empty, can happen when the
  // subgraph is trailing on the latest update.
  if (chart.length && chart[chart.length - 1].assetPrice === 0) {
    chart.pop();
  }

  return chart;
}

export function useAccountHistoryChart(
  network: Network | undefined,
  startTime: number,
  endTime: number,
  tickSizeInSeconds: number
) {
  const account = useAccountDefinition(network);
  const { baseCurrency } = useAppStore();

  return useMemo(() => {
    if (!account) return undefined;
    // These are sorted ascending by default
    const allHistoricalSnapshots = account?.historicalBalances || [];

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
            }, new TokenBalance(0, baseCurrency, Network.all));

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
            }, new TokenBalance(0, baseCurrency, Network.all));

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
