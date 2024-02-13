import { Network } from '@notional-finance/util';

export interface Env {
  NETWORK: keyof typeof Network,
  DD_API_KEY: string,
  DD_APP_KEY: string,
  INFURA_KEY: string,
  BN_API_KEY: string,
  TX_RELAY_AUTH_TOKEN: string,
  ZERO_EX_API_KEY: string,
  ZERO_EX_API_URL: string,
  MANAGERS: string,
  MANAGER_BOT_ADDRESS: string,
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



