import { types, flow, getSnapshot } from 'mobx-state-tree';
import { NotionalTypes, TokenDefinitionModel } from './ModelTypes';
import {
  SerializedToken,
  TokenRegistryServer,
} from '../server/token-registry-server';
import { Env } from '../server';

const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.optional(types.map(TokenDefinitionModel), {}),
});

export const NetworkServerModel = NetworkModel.named('NetworkServer').actions(
  (self) => {
    let saveStorage: () => Promise<void>;
    let tokenRegistry: TokenRegistryServer;

    const refresh = flow(function* () {
      const tokens: Map<string, SerializedToken> =
        yield tokenRegistry.fetchForModel(self.network);
      self.tokens.replace(tokens);

      if (saveStorage) yield saveStorage();
    });

    return {
      refresh,
      initialize: (
        storageMethod: (data: string) => Promise<void>,
        env: Env
      ) => {
        tokenRegistry = new TokenRegistryServer(env);
        saveStorage = () => {
          return storageMethod(JSON.stringify(getSnapshot(self)));
        };
      },
    };
  }
);
