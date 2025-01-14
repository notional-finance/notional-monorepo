import { flow, Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { ChartType, TimeSeriesResponse } from '../ModelTypes';
import { Network } from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';
import { TokenDefinition } from '../../Definitions';

const REGISTRY_HOSTNAME =
  (process.env['NX_REGISTRY_URL'] as string) ||
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
      `${REGISTRY_HOSTNAME}/${self.network}/views/${id}`
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
        return `${network}/views/historicalTrading`;
      case 'vaultReinvestment':
        return `${network}/views/vaultReinvestment`;
      case 'vaultAccountRisk':
        return `${network}/accounts/vaultRisk`;
      case 'accountPortfolioRisk':
        return `${network}/accounts/portfolioRisk`;
      case 'priceChanges':
        return `${network}/views/priceChanges`;
      default:
        throw new Error(`Unknown analytics key: ${String(key)}`);
    }
  };

  const parseData = (
    key: keyof typeof self.analytics,
    data: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (
      (key === 'noteSupply' ||
        key === 'sNOTEData' ||
        key === 'sNOTEReinvestment') &&
      data['result']
    ) {
      return data['result']['rows'];
    } else {
      return data;
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
    try {
      const data = parseData(key, yield response.json());
      self.analytics[key] = data;
      return data;
    } catch (e) {
      console.error(e);
      return undefined;
    }
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
    self.analytics.noteSupply?.map((r) => ({
      ...r,
      date: new Date(r.day),
    })),
  getSNOTEData: () => self.analytics.sNOTEData,
  getSNOTEReinvestment: () => self.analytics.sNOTEReinvestment,
  getPointPrices: () => self.analytics.pointPrices,
  getHistoricalTrading: (currencyId: number) =>
    self.analytics.historicalTrading?.get(currencyId.toString()),
  getVaultReinvestment: (vaultAddress: string) =>
    self.analytics.vaultReinvestment
      ? self.analytics.vaultReinvestment.get(vaultAddress)
      : undefined,
  getVaultAccountRisk: () => self.analytics.vaultAccountRisk,
  getAccountPortfolioRisk: () => self.analytics.accountPortfolioRisk,
  getPriceChanges: (assetId: string) => {
    const change = self.analytics.priceChanges?.get(assetId);
    const token = self.tokens.get(assetId) as TokenDefinition | undefined;
    if (token && change) {
      const unit = TokenBalance.unit(token);
      const currentFiat =
        unit.symbol === 'NOTE' ? unit.toFiat('ETH') : unit.toFiat('USD');
      const currentUnderlying =
        unit.tokenType !== 'Underlying' && unit.tokenType !== 'Fiat'
          ? unit.toUnderlying()
          : undefined;

      const calculateChange = (period: 'oneDay' | 'threeDay' | 'sevenDay') => {
        const periodData = change[period];
        if (!periodData) return undefined;

        return {
          ...periodData,
          currentFiat,
          fiatChange:
            periodData.pastFiat &&
            (100 * (currentFiat.toFloat() - periodData.pastFiat.toFloat())) /
              periodData.pastFiat.toFloat(),
          underlyingChange:
            periodData.pastUnderlying &&
            currentUnderlying &&
            (100 * (currentUnderlying.toFloat() - periodData.pastUnderlying)) /
              periodData.pastUnderlying,
        };
      };

      return {
        oneDay: calculateChange('oneDay'),
        threeDay: calculateChange('threeDay'),
        sevenDay: calculateChange('sevenDay'),
      };
    }

    return undefined;
  },
});
