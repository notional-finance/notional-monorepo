import { Network } from '@notional-finance/util';

export interface Env {
  NETWORK: Network,
  TX_RELAY_AUTH_TOKEN: string,
  ZERO_EX_API_KEY: string,
  MANAGER_BOT_ADDRESS: string,
  SUBGRAPH_API_KEY: string,
  AUTH_KEY: string
}

export enum RunType {
  sellCOMP = 'sellCOMP',
  burnNOTE = 'noteBurn',
}

export enum DexId {
  UNKNOWN,
  UNISWAP_V2,
  UNISWAP_V3,
  ZERO_EX,
  BALANCER_V2,
  CURVE,
  NOTIONAL_VAULT
}

export enum TradeType {
  EXACT_IN_SINGLE,
  EXACT_OUT_SINGLE,
  EXACT_IN_BATCH,
  EXACT_OUT_BATCH
}



