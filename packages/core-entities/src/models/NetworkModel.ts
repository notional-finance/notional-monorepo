import { types, flow, getSnapshot } from 'mobx-state-tree';
import { NotionalTypes, TokenDefinitionModel } from './ModelTypes';
import {
  SerializedToken,
  TokenRegistryServer,
} from '../server/token-registry-server';

const NetworkModel = types.model('Network', {
  network: NotionalTypes.Network,
  tokens: types.map(TokenDefinitionModel),
});

const NX_SUBGRAPH_API_KEY = process.env['NX_SUBGRAPH_API_KEY'] as string;

export const NetworkServerModel = NetworkModel.named('NetworkServer').actions(
  (self) => {
    let saveStorage: () => Promise<void>;
    const tokenRegistry = new TokenRegistryServer({
      NX_SUBGRAPH_API_KEY,
    });

    const refresh = flow(function* () {
      const tokens: Map<string, SerializedToken> =
        yield tokenRegistry.fetchForModel(self.network);
      self.tokens.replace(tokens);

      if (saveStorage) yield saveStorage();
    });

    return {
      refresh,
      setStorageMethod: (fn: (data: string) => Promise<void>) => {
        saveStorage = () => {
          return fn(JSON.stringify(getSnapshot(self)));
        };
      },
    };
  }
);
