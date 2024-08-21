import { types, flow, getSnapshot } from 'mobx-state-tree';
import {
  ConfigurationModel,
  ExchangeModel,
  NotionalTypes,
  OracleDefinitionModel,
  TokenDefinitionModel,
  VaultDefinitionModel,
} from './ModelTypes';
import {
  SerializedToken,
  TokenRegistryServer,
} from '../server/token-registry-server';
import { Env } from '../server';
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
});

export const NetworkServerModel = NetworkModel.named('NetworkServer').actions(
  (self) => {
    let saveStorage: () => Promise<void>;
    let tokenRegistry: TokenRegistryServer;
    let configurationRegistry: ConfigurationServer;
    let exchangeRegistry: ExchangeRegistryServer;
    let oracleRegistry: OracleRegistryServer;
    let vaultRegistry: VaultRegistryServer;

    const refresh = flow(function* () {
      // Tokens
      const tokens: Map<string, SerializedToken> =
        yield tokenRegistry.fetchForModel(self.network);
      self.tokens.replace(tokens);

      // Configuration
      const configuration = yield configurationRegistry.fetchForModel(
        self.network
      );
      self.configuration = configuration.get(self.network);

      // Exchanges
      const exchanges = yield exchangeRegistry.fetchForModel(self.network);
      self.exchanges.replace(exchanges);

      // Oracles
      const oracles = yield oracleRegistry.fetchForModel(self.network);
      self.oracles.replace(oracles);

      // Vaults
      const vaults = yield vaultRegistry.fetchForModel(self.network);
      self.vaults.replace(vaults);

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
