import { flow } from 'mobx';
import { Instance, types } from 'mobx-state-tree';
import { mutate } from 'swr';
import { NotionalTypes, TimeSeriesDataPoint } from './ModelTypes';
import { Network } from '@notional-finance/util';

export interface TimeSeriesLegend {
  series: string;
  format: 'number' | 'percent';
  decimals?: number;
}

export interface TimeSeriesResponse {
  id: string;
  data: TimeSeriesDataPoint[];
  legend: TimeSeriesLegend[];
}

const TimeSeriesModel = types.model('TimeSeriesModel', {
  id: types.identifier,
  data: types.array(NotionalTypes.TimeSeriesDataPoint),
  legend: types.array(
    types.model({
      series: types.array(types.string),
      format: types.enumeration('format', ['number', 'percent', 'bignumber']),
      decimals: types.maybe(types.number),
    })
  ),
});

export async function fetchTimeSeries(hostname: string, path: string) {
  const response = await fetch(`${hostname}${path}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json() as Promise<TimeSeriesResponse>;
}

export enum ChartType {
  APY = 'apy',
  PRICE = 'price',
}

export const AnalyticsModel = types
  .model('Analytics', {
    timeSeries: types.optional(types.map(TimeSeriesModel), {}),
  })
  .actions((self) => ({
    fetchChartData: flow(function* (
      network: Network,
      tokenId: string,
      chartType: ChartType
    ) {
      const key = `${network}/views/${tokenId}:${chartType}`;

      // Check if the data is already in the store
      if (self.timeSeries.has(key)) {
        return self.timeSeries.get(key);
      }

      // If not in cache, fetch data
      try {
        const data = yield fetchTimeSeries(
          'https://registry.notional.finance',
          key
        );
        // Update SWR cache (which will also update the MST store)
        mutate(key, data, false);
        return data;
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        throw error;
      }
    }),
  }));

export const analyticsStore = AnalyticsModel.create({});

// TODO: what if not fetching time series data using SWR?
export const AnalyticsCache = {
  get: (key: string) => analyticsStore.timeSeries.get(key),
  set: (key: string, value: Instance<typeof TimeSeriesModel>) =>
    analyticsStore.timeSeries.set(key, value),
  delete: (key: string) => analyticsStore.timeSeries.delete(key),
  keys: () => analyticsStore.timeSeries.keys(),
};
