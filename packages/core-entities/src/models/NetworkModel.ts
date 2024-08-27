import { getNowSeconds } from '@notional-finance/util';
import {
  types,
  flow,
  getSnapshot,
  applySnapshot,
  Instance,
} from 'mobx-state-tree';
import {
  ConfigurationModel,
  ExchangeModel,
  NotionalTypes,
  OracleDefinitionModel,
  TokenDefinitionModel,
  VaultDefinitionModel,
} from './ModelTypes';
import { Env } from '../server';
import { TokenRegistryServer } from '../server/token-registry-server';
import { ConfigurationServer } from '../server/configuration-server';
import { ExchangeRegistryServer } from '../server/exchange-registry-server';
import { OracleRegistryServer } from '../server/oracle-registry-server';
import { VaultRegistryServer } from '../server/vault-registry-server';
import { VaultViews, ExchangeViews } from './views';
import { TokenViews } from './views/TokenViews';
import { ConfigurationViews } from './views/ConfigurationViews';

export const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.optional(types.map(TokenDefinitionModel), {}),
  configuration: types.maybe(ConfigurationModel),
  exchanges: types.optional(types.map(ExchangeModel), {}),
  oracles: types.optional(types.map(OracleDefinitionModel), {}),
  vaults: types.optional(types.map(VaultDefinitionModel), {}),
  lastUpdated: types.optional(types.number, 0),
});

export const NetworkServerModel = NetworkModel.named('NetworkServer').actions(
  (self) => {
    let saveStorage: () => Promise<void>;
    let tokenRegistry: TokenRegistryServer;
    let configurationRegistry: ConfigurationServer;
    let exchangeRegistry: ExchangeRegistryServer;
    let oracleRegistry: OracleRegistryServer;
    let vaultRegistry: VaultRegistryServer;

    const refresh = flow(function* (isFullRefresh: boolean) {
      if (isFullRefresh) {
        // Run token and configuration fetches concurrently
        // TODO: add registerToken into the snapshots...
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
      self.oracles.replace(oracles);
      self.vaults.replace(vaults);

      self.lastUpdated = getNowSeconds();

      if (saveStorage) yield saveStorage();
    });

    return {
      refresh,
      initialize: (
        storageMethod: (data: string) => Promise<void>,
        env: Env
      ) => {
        tokenRegistry = new TokenRegistryServer(env);
        configurationRegistry = new ConfigurationServer(env);
        exchangeRegistry = new ExchangeRegistryServer(env);
        oracleRegistry = new OracleRegistryServer(env);
        vaultRegistry = new VaultRegistryServer(env);

        saveStorage = () => {
          return storageMethod(JSON.stringify(getSnapshot(self)));
        };
      },
    };
  }
);

const REGISTRY_URL = 'https://registry.notional.finance';

// NOTE: this is an initial implementation of the client model which has some views
// defined that the other models depend on.
const NetworkClientModelInternal = NetworkModel.named('NetworkClient').views(
  (self) => ({
    ...TokenViews(self),
    ...ConfigurationViews(self),
  })
);

export type NetworkModelType = Instance<typeof NetworkClientModelInternal>;

export const NetworkClientModel = NetworkClientModelInternal.views((self) => ({
  ...VaultViews(self),
  ...ExchangeViews(self),
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
  });

  return {
    triggerRefresh,
    afterCreate: () => {
      triggerRefresh();
    },
  };
});
