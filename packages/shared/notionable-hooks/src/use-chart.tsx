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
  firstValue,
} from '@notional-finance/util';
import { useAccountDefinition } from './use-account';
import { useEffect, useMemo } from 'react';
import { useAppStore, useCurrentNetworkStore } from './context/use-root-store';
import { useObserver } from 'mobx-react-lite';

const useFetchAPYData = (
  id: string | undefined,
  network: Network | undefined,
  chartType: ChartType
) => {
  const d = useObserver(() => {
    if (!id)
      return {
        data: undefined,
        isLoading: true,
        error: undefined,
      };

    const model = getNetworkModel(network);
    return model.getTimeSeries(id, chartType);
  });

  useEffect(() => {
    if (d.data === undefined && id && network) {
      const asyncFetch = async () => {
        const model = getNetworkModel(network);
        await model.fetchTimeSeriesData(id, chartType);
      };
      asyncFetch();
    }
  }, [d.data, id, network, chartType]);

  return d;
};

export const useVaultAPYData = (
  vaultAddress: string | undefined,
  network: Network | undefined
) => {
  return useFetchAPYData(vaultAddress, network, ChartType.APY);
};

export const useChartData = (
  token: TokenDefinition | undefined,
  chartType: ChartType
) => {
  const tokenId =
    token?.tokenType === 'VaultShare' && chartType === ChartType.APY
      ? token.vaultAddress
      : token?.id;
  const network = token?.network;

  return useFetchAPYData(tokenId, network, chartType);
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
  leverageRatio: number | null | undefined
) {
  const currentNetworkStore = useCurrentNetworkStore();
  const primeDebt = token
    ? currentNetworkStore.getPrimeDebt(token.currencyId)
    : undefined;
  const { data: tokenAPY } = useChartData(token, ChartType.APY);
  const { data: primeBorrowAPY } = useChartData(primeDebt, ChartType.APY);

  if (!token) return [];
  return fillChartDaily(
    tokenAPY?.data?.map((d) => {
      const totalAPY = d['totalAPY'] || 0;
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

export function useAssetPriceHistory(
  token: TokenDefinition | undefined,
  numDays = 60
) {
  const { data: tokenPrice } = useChartData(token, ChartType.PRICE);

  const chart = fillChartDaily(
    tokenPrice?.data?.slice(-numDays).map((d) => ({
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
  _startTime: number | undefined,
  endTime: number,
  tickSizeInSeconds: number
) {
  const account = useAccountDefinition(network);
  const { baseCurrency } = useAppStore();

  return useMemo(() => {
    if (!account || !account.historicalBalances) return undefined;

    const allHistoricalSnapshots = account.historicalBalances;
    const startTime =
      _startTime || firstValue(allHistoricalSnapshots)?.timestamp;
    if (!startTime) return undefined;

    const numBuckets = Math.ceil((endTime - startTime) / tickSizeInSeconds);

    try {
      // Pre-process and index
      const snapshotIndex: Map<number, number[]> = new Map();
      const fiatValues: Map<any, any> = new Map(); // Map snapshot to fiat value

      allHistoricalSnapshots.forEach((snapshot, index) => {
        const timestamp = snapshot.timestamp;
        if (!snapshotIndex.has(timestamp)) {
          snapshotIndex.set(timestamp, []);
        }
        snapshotIndex.get(timestamp)!.push(index);
        fiatValues.set(
          snapshot,
          snapshot.balance
            .unwrapVaultToken()
            .toUnderlying()
            .toFiat(baseCurrency, floorToMidnight(endTime))
        );
      });

      const result: {
        timestamp: number;
        assets: TokenBalance;
        debts: TokenBalance;
        netWorth: TokenBalance;
      }[] = [];
      for (let i = 0; i < numBuckets; i++) {
        const start = startTime + i * tickSizeInSeconds;
        const end = start + tickSizeInSeconds;

        let assets = new TokenBalance(0, baseCurrency, Network.all);
        let debts = new TokenBalance(0, baseCurrency, Network.all);

        // Binary search to find relevant snapshots
        const relevantSnapshots = allHistoricalSnapshots.filter(
          ({ timestamp }) => timestamp >= start && timestamp < end
        );

        const snapshotMap: Map<
          string,
          (typeof allHistoricalSnapshots)[number]
        > = new Map();
        relevantSnapshots.forEach((snapshot) => {
          snapshotMap.set(snapshot.balance.tokenId, snapshot);
        });
        const uniqueSnapshots = Array.from(snapshotMap.values());

        uniqueSnapshots.forEach((snapshot) => {
          const balance = snapshot.balance;
          const fiatValue = fiatValues.get(snapshot);

          if (
            balance.tokenType === 'VaultDebt' ||
            balance.unwrapVaultToken().token.isFCashDebt === true ||
            balance.unwrapVaultToken().tokenType === 'PrimeDebt' ||
            balance.isNegative()
          ) {
            debts = debts.add(fiatValue);
          } else {
            assets = assets.add(fiatValue);
          }
        });

        result.push({
          timestamp: start,
          assets,
          debts: debts.abs(),
          netWorth: assets.add(debts),
        });
      }

      return result;
    } catch (e) {
      return undefined;
    }
  }, [account, baseCurrency, endTime, tickSizeInSeconds, _startTime]);
}
