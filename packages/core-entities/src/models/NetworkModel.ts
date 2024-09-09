import { getNowSeconds } from '@notional-finance/util';
import { types, flow, getSnapshot, applySnapshot } from 'mobx-state-tree';
import {
  ConfigurationModel,
  ExchangeModel,
  NotionalTypes,
  OracleDefinitionModel,
  OracleGraphModel,
  TokenDefinitionModel,
  VaultDefinitionModel,
  TimeSeriesModel,
  ChartType,
} from './ModelTypes';
import { Env } from '../server';
import { TokenRegistryServer } from '../server/token-registry-server';
import { ConfigurationServer } from '../server/configuration-server';
import { ExchangeRegistryServer } from '../server/exchange-registry-server';
import { OracleRegistryServer } from '../server/oracle-registry-server';
import { VaultRegistryServer } from '../server/vault-registry-server';
import { TokenViews } from './views/TokenViews';
import { VaultViews } from './views/VaultViews';
import { ExchangeViews } from './views/ExchangeViews';
import { TimeSeriesActions, TimeSeriesViews } from './views/TimeSeriesViews';
import {
  ConfigurationViews,
  registerVaultData,
} from './views/ConfigurationViews';
import defaultPools from '../exchanges/default-pools';
import { buildOracleGraph, OracleViews } from './views/OracleViews';
import { YieldViews } from './views/YieldViews';
import { whitelistedVaults } from '../config/whitelisted-vaults';

const REGISTRY_URL = 'https://registry.notional.finance';

export const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.optional(types.map(TokenDefinitionModel), {}),
  configuration: types.maybe(ConfigurationModel),
  exchanges: types.optional(types.map(ExchangeModel), {}),
  oracles: types.optional(types.map(OracleDefinitionModel), {}),
  oracleGraph: types.optional(OracleGraphModel, {}),
  vaults: types.optional(types.map(VaultDefinitionModel), {}),
  timeSeries: types.optional(types.map(TimeSeriesModel), {}),
  timeSeriesState: types.optional(
    types.map(
      types.model({
        id: types.identifier,
        isLoading: types.boolean,
        error: types.maybe(types.string),
      })
    ),
    {}
  ),
  lastUpdated: types.optional(types.number, 0),
});

// NOTE: this is an initial implementation of the client model which has some views
// defined that the other models depend on.
const NetworkModelWithViews = NetworkModel.named('NetworkModelIntermediate')
  .actions((self) => ({
    ...TimeSeriesActions(self),
  }))
  .views((self) => ({
    ...TokenViews(self),
    ...ConfigurationViews(self),
    ...TimeSeriesViews(self),
    ...VaultViews(self),
    ...ExchangeViews(self),
    ...OracleViews(self),
    get isReady() {
      return self.lastUpdated > 0;
    },
  }));

export const NetworkServerModel = NetworkModelWithViews.named(
  'NetworkServer'
).actions((self) => {
  let saveStorage: () => Promise<void>;
  let tokenRegistry: TokenRegistryServer;
  let configurationRegistry: ConfigurationServer;
  let exchangeRegistry: ExchangeRegistryServer;
  let oracleRegistry: OracleRegistryServer;
  let vaultRegistry: VaultRegistryServer;

  const refresh = flow(function* (isFullRefresh: boolean) {
    if (isFullRefresh) {
      // Run token and configuration fetches concurrently
      const [tokens, configuration] = yield Promise.all([
        tokenRegistry.fetchForModel(self.network),
        configurationRegistry.fetchForModel(self.network),
      ]);

      self.tokens.replace(tokens);
      self.configuration = configuration.get(self.network);
    }

    const [exchanges, oracles, vaults] = yield Promise.all([
      exchangeRegistry.fetchForModel(self.network),
      oracleRegistry.fetchForModel(self.network),
      vaultRegistry.fetchForModel(self.network),
    ]);

    self.exchanges.replace(exchanges);

    // TODO: add note oracle definition inside the server
    self.oracles.replace(oracles);
    self.vaults.replace(vaults);

    // Registers vault tokens and vault oracles
    registerVaultData(self);
    // Registers default pool tokens for exchanges
    defaultPools[self.network].forEach((pool) =>
      pool.registerTokens.forEach((t) => {
        if (!self.tokens.has(t.id.toLowerCase())) {
          self.tokens.set(t.id.toLowerCase(), { ...t, id: t.id.toLowerCase() });
        }
      })
    );

    // Just use the array here for type simplicity, we rebuild the graph every time
    self.oracleGraph.adjList.replace(
      buildOracleGraph(Array.from(self.oracles.values()))
    );

    self.lastUpdated = getNowSeconds();

    if (saveStorage) yield saveStorage();
  });

  return {
    refresh,
    initialize: (storageMethod: (data: string) => Promise<void>, env: Env) => {
      tokenRegistry = new TokenRegistryServer(env);
      configurationRegistry = new ConfigurationServer(env);
      exchangeRegistry = new ExchangeRegistryServer(env);
      oracleRegistry = new OracleRegistryServer(env);
      vaultRegistry = new VaultRegistryServer(env);
      // TODO: need to fetch from previous snapshot and apply it here if not doing a full refresh

      saveStorage = () => {
        return storageMethod(JSON.stringify(getSnapshot(self)));
      };
    },
  };
});

export const NetworkClientModel = NetworkModelWithViews.views((self) => ({
  ...YieldViews(self),
})).actions((self) => {
  const triggerRefresh = flow(function* () {
    const startTime = performance.now();
    const response = yield fetch(`${REGISTRY_URL}/${self.network}/snapshot`);
    const snapshot = yield response.json();
    applySnapshot(self, snapshot);
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(
      `${self.network} snapshot refreshed in ${duration.toFixed(2)}ms`
    );

    // NOTE: just trigger this in the background so the APYs can load.
    whitelistedVaults(self.network).forEach((vaultAddress) => {
      self.fetchChartData(vaultAddress, ChartType.APY);
    });
  });

  return {
    triggerRefresh,
    afterCreate: () => {
      triggerRefresh();
    },
  };
});
