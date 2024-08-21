import { types, flow, getSnapshot } from 'mobx-state-tree';
import {
  ConfigurationModel,
  NotionalTypes,
  TokenDefinitionModel,
} from './ModelTypes';
import {
  SerializedToken,
  TokenRegistryServer,
} from '../server/token-registry-server';
import { Env } from '../server';
import { ConfigurationServer } from '../server/configuration-server';

const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.optional(types.map(TokenDefinitionModel), {}),
  configuration: types.maybe(ConfigurationModel),
});

export const NetworkServerModel = NetworkModel.named('NetworkServer').actions(
  (self) => {
    let saveStorage: () => Promise<void>;
    let tokenRegistry: TokenRegistryServer;
    let configurationRegistry: ConfigurationServer;

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

        saveStorage = () => {
          return storageMethod(JSON.stringify(getSnapshot(self)));
        };
      },
    };
  }
);
