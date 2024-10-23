import { flow, Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { ChartType, TimeSeriesResponse } from '../ModelTypes';
import { Network } from '@notional-finance/util';

const REGISTRY_HOSTNAME =
  (process.env['NX_REGISTRY_HOSTNAME'] as string) ||
  'https://registry.notional.finance';

export const AnalyticsActions = (self: Instance<typeof NetworkModel>) => {
  const fetchTimeSeriesData = flow(function* (
    tokenId: string,
    chartType: ChartType
  ) {
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
  });

  const KeyToSuffix = (key: keyof typeof self.analytics, network: Network) => {
    switch (key) {
      case 'noteSupply':
        return `${Network.mainnet}/note/NOTESupply`;
      case 'sNOTEData':
        return `${Network.mainnet}/note/sNOTEPoolData`;
      case 'sNOTEReinvestment':
        return `${Network.mainnet}/note/sNOTEReinvestment`;
      case 'pointPrices':
        return `${Network.all}/views/points_prices`;
      case 'historicalTrading':
        return `${network}/views/historical_trading`;
      case 'vaultReinvestment':
        return `${network}/views/vault_reinvestment`;
      case 'vaultAccountRisk':
        return `${network}/accounts/vaultRisk`;
      case 'accountPortfolioRisk':
        return `${network}/accounts/portfolioRisk`;
      case 'priceChanges':
        return `${network}/views/price_changes`;
      default:
        throw new Error(`Unknown analytics key: ${String(key)}`);
    }
  };

  const fetchAnalyticsData = flow(function* <
    K extends keyof typeof self.analytics
  >(key: K) {
    if (self.analytics[key]) return self.analytics[key];

    const response = yield fetch(
      `${REGISTRY_HOSTNAME}/${KeyToSuffix(key, self.network)}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${String(key)}: ${response.statusText}`);
    }
    const data = yield response.json();
    self.analytics[key] = data;
    return data;
  });

  return {
    fetchTimeSeriesData,
    fetchAnalyticsData,
  };
};

export const AnalyticsViews = (self: Instance<typeof NetworkModel>) => ({
  getTimeSeries: (tokenId: string, chartType: ChartType) => {
    const id = `${tokenId}:${chartType}`;

    return {
      data: self.timeSeries.get(id),
      isLoading: self.timeSeriesState.get(id)?.isLoading,
      error: self.timeSeriesState.get(id)?.error,
    };
  },
  getNoteSupply: () =>
    self.analytics.noteSupply?.result.rows.map((r) => ({
      ...r,
      date: new Date(r.day),
    })),
  getSNOTEData: () => self.analytics.sNOTEData?.result.rows,
  getSNOTEReinvestment: () => self.analytics.sNOTEReinvestment?.result.rows,
  getPointPrices: () => self.analytics.pointPrices,
  getHistoricalTrading: () => self.analytics.historicalTrading,
  getVaultReinvestment: (vaultAddress: string) =>
    self.analytics.vaultReinvestment
      ? self.analytics.vaultReinvestment.get(vaultAddress)
      : undefined,
  getVaultAccountRisk: () => self.analytics.vaultAccountRisk,
  getAccountPortfolioRisk: () => self.analytics.accountPortfolioRisk,
  getPriceChanges: () => self.analytics.priceChanges,
});
