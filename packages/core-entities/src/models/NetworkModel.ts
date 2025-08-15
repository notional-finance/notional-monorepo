import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { types, flow, getSnapshot, applySnapshot } from 'mobx-state-tree';
import {
  ExchangeModel,
  NotionalTypes,
  OracleDefinitionModel,
  OracleGraphModel,
  TokenDefinitionModel,
  VaultDefinitionModel,
  TimeSeriesModel,
  ChartType,
  AnalyticsModel,
  ConfigurationModel,
} from './ModelTypes';
import { Env } from '../server';
import { TokenRegistryServer } from '../server/token-registry-server';
import { ConfigurationServer } from '../server/configuration-server';
import { ExchangeRegistryServer } from '../server/exchange-registry-server';
import {
  OracleRegistryServer,
  sNOTEOracle,
} from '../server/oracle-registry-server';
import { VaultRegistryServer } from '../server/vault-registry-server';
import { TokenViews } from './views/TokenViews';
import { VaultViews } from './views/VaultViews';
import { ExchangeViews } from './views/ExchangeViews';
import { AnalyticsActions, AnalyticsViews } from './views/AnalyticsViews';
import { ConfigurationViews } from './views/ConfigurationViews';
import defaultPools from '../exchanges/default-pools';
import { buildOracleGraph, OracleViews } from './views/OracleViews';
import { YieldViews } from './views/YieldViews';
import { whitelistedVaults } from '../config/whitelisted-vaults';

const REGISTRY_URL =
  process.env['NX_REGISTRY_URL'] ||
  process.env['REGISTRY_URL'] ||
  'https://registry.notional.finance';

export const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.optional(types.map(TokenDefinitionModel), {}),
  configuration: types.maybe(ConfigurationModel),
  exchanges: types.optional(types.map(ExchangeModel), {}),
  oracles: types.optional(types.map(OracleDefinitionModel), {}),
  oracleGraph: types.optional(OracleGraphModel, {}),
  vaults: types.optional(types.map(VaultDefinitionModel), {}),
  timeSeries: types.optional(types.map(TimeSeriesModel), {}),
  analytics: types.optional(AnalyticsModel, {}),
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
  lastUpdatedBlock: types.optional(types.number, 0),
});

// NOTE: this is an initial implementation of the client model which has some views
// defined that the other models depend on.
const NetworkModelWithViews = NetworkModel.named('NetworkModelIntermediate')
  .actions((self) => ({
    ...AnalyticsActions(self),
  }))
  .views((self) => ({
    ...TokenViews(self),
    ...ConfigurationViews(self),
    ...AnalyticsViews(self),
    ...ExchangeViews(self),
    ...OracleViews(self),
    ...YieldViews(self),
    ...VaultViews(self),
    isReady: () => self.lastUpdated > 0,
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
      const [tokens, configuration, blockNumber] = yield Promise.all([
        tokenRegistry.fetchForModel(self.network),
        configurationRegistry.fetchForModel(self.network),
        getProviderFromNetwork(self.network, true).getBlockNumber(),
      ]);

      self.tokens.replace(tokens);
      self.configuration = configuration.get(self.network);
      self.lastUpdatedBlock = blockNumber;
    }

    const vaults = yield vaultRegistry.fetchForModel(self.network);
    const exchanges = yield exchangeRegistry.fetchForModel(self.network);
    const oracles = yield oracleRegistry.fetchForModel(self.network);

    self.exchanges.replace(exchanges);

    // TODO: add note oracle definition inside the server
    self.oracles.replace(oracles);
    self.vaults.replace(vaults);

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

export const NetworkClientModel = NetworkModelWithViews.actions((self) => {
  const triggerRefresh = flow(function* (isCreate = false) {
    const startTime = performance.now();
    console.log(
      'Refreshing snapshot using url',
      `${REGISTRY_URL}/${self.network}/v4/snapshot`
    );
    const response = yield fetch(`${REGISTRY_URL}/${self.network}/v4/snapshot`);
    const snapshot = yield response.json();

    applySnapshot(self, {
      ...snapshot,
      timeSeries: self.timeSeries,
      timeSeriesState: self.timeSeriesState,
      analytics: self.analytics,
    });
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(
      `${self.network} snapshot refreshed in ${duration.toFixed(2)}ms`
    );

    // Register the sNOTE oracle price here since it is calculated from the pool, note that this needs
    // to be re-applied on every snapshot refresh since the price is not persisted.
    if (self.network === Network.mainnet) {
      const sNOTEPool = self.getSNOTEPool();
      if (!sNOTEPool) return;

      // The sNOTE price oracle here is the NOTE price, not the sNOTE price, it
      // will get calculated to the sNOTE price via the method here.
      const noteETHExchangeRate =
        self.oracles.get(sNOTEOracle)?.latestRate.rate;
      const o = OracleRegistryServer.registerSNOTEOracle(
        sNOTEPool,
        noteETHExchangeRate
      );
      // Register the sNOTE oracle price here
      self.oracles.set(o.id, o);
    }

    // NOTE: just trigger this in the background so the APYs can load.
    if (isCreate) {
      whitelistedVaults(self.network).forEach((vaultAddress) => {
        self.fetchTimeSeriesData(vaultAddress, ChartType.APY);
      });
    }
  });

  return {
    triggerRefresh,
    afterCreate: () => {
      triggerRefresh(true);
    },
  };
});
