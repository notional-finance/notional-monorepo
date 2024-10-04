import { Logger, Network } from '@notional-finance/util';

export interface Env {
  LOGGER: Logger; // need to be set in worker
  NETWORKS: Array<Exclude<Network, Network.all>>;
  NETWORK: Exclude<Network, Network.all>;
  TX_RELAY_AUTH_TOKEN: string;
  ZERO_EX_API_KEY: string;
  AUTH_KEY: string;
  SUBGRAPH_API_KEY: string;
  REWARDS_KV: KVNamespace;
  NX_DD_API_KEY: string;
}
