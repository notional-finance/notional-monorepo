import { flow, Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { ChartType, TimeSeriesResponse } from '../ModelTypes';

const REGISTRY_HOSTNAME =
  (process.env['NX_REGISTRY_HOSTNAME'] as string) ||
  'https://registry.notional.finance';

export const AnalyticsActions = (self: Instance<typeof NetworkModel>) => ({
  fetchTimeSeriesData: flow(function* (tokenId: string, chartType: ChartType) {
    const id = `${tokenId}:${chartType}`;
    if (self.timeSeries.has(id)) return self.timeSeries.get(id);
    self.timeSeriesState.set(id, { id, isLoading: true });

    const response = yield fetch(
      `${REGISTRY_HOSTNAME}/${self.network}/views-dev/${id}`
    );
    if (!response.ok) {
      self.timeSeriesState.set(id, {
        id,
        isLoading: false,
        error: response.statusText,
      });
    }
    const data: TimeSeriesResponse = yield response.json();
    self.timeSeries.set(id, data);
    self.timeSeriesState.set(id, { id, isLoading: false, error: undefined });

    return data;
  }),
});

export const AnalyticsViews = (self: Instance<typeof NetworkModel>) => ({
  getTimeSeries: (tokenId: string, chartType: ChartType) => {
    const id = `${tokenId}:${chartType}`;

    return {
      data: self.timeSeries.get(id),
      isLoading: self.timeSeriesState.get(id)?.isLoading,
      error: self.timeSeriesState.get(id)?.error,
    };
  },
});

// TODO: add other data set actions here...
// - point prices
// - historical trading
// - reinvestment views
// - note data
// - kpi data
// - risk data
// - all transaction data
// - price changes
