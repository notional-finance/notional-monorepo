import { TimeSeriesDataPoint } from './ModelTypes';
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

export async function fetchTimeSeries(
  hostname: string,
  network: Network | undefined,
  key: string | undefined
) {
  if (!network || !key) return;

  const response = await fetch(`${hostname}/${network}/views-dev/${key}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json() as Promise<TimeSeriesResponse>;
}

export enum ChartType {
  APY = 'apy',
  PRICE = 'price',
}

// TODO: this is unused right now
// const TimeSeriesModel = types.model('TimeSeriesModel', {
//   id: types.identifier,
//   data: types.array(NotionalTypes.TimeSeriesDataPoint),
//   legend: types.array(
//     types.model({
//       series: types.string,
//       format: types.enumeration('format', ['number', 'percent']),
//       decimals: types.maybe(types.number),
//     })
//   ),
// });

// export const AnalyticsModel = types
//   .model('Analytics', {
//     timeSeries: types.optional(types.map(TimeSeriesModel), {}),
//   })
//   .actions((self) => ({
//     fetchChartData: flow(function* (
//       network: Network,
//       tokenId: string,
//       chartType: ChartType
//     ) {
//       console.log(
//         'inside fetch chart data function',
//         network,
//         tokenId,
//         chartType
//       );
//       const key = `${tokenId}:${chartType}`;

//       // Check if the data is already in the store
//       if (self.timeSeries.has(key)) {
//         return self.timeSeries.get(key);
//       }

//       // If not in cache, fetch data
//       try {
//         const data = yield fetchTimeSeries(
//           'https://registry.notional.finance',
//           network,
//           key
//         );
//         // Update SWR cache (which will also update the MST store)
//         mutate(key, data, false);
//         return data;
//       } catch (error) {
//         console.error('Failed to fetch chart data:', error);
//         throw error;
//       }
//     }),
//     setKey: (key: string, value: Instance<typeof TimeSeriesModel>) => {
//       self.timeSeries.set(key, value);
//     },
//     deleteKey: (key: string) => {
//       self.timeSeries.delete(key);
//     },
//   }));
