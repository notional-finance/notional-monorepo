import { getNowSeconds } from '@notional-finance/util';
import { types, flow, getSnapshot } from 'mobx-state-tree';
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

const NetworkModel = types.model('Network', {
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
