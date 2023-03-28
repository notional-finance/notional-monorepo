import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { BlockTriggerEvent } from 'defender-autotask-utils';
import { BigNumber } from 'ethers';

export interface SentinalRequest {
  events: BlockTriggerEvent[];
}
export interface APIEnv {
  KPIS_DO: DurableObjectNamespace;
  YIELDS_DO: DurableObjectNamespace;
  KPIS_NAME: string;
  YIELDS_NAME: string;
  SENTINEL_ID: string;
  NX_DD_API_KEY: string;
  GHOST_ADMIN_KEY: string;
}

export interface GetExchangeRatesResponse {
  blockNumber: number;
  network: string;
  results: ExchangeRate[];
}

export interface ExchangeRate {
  quote: string;
  base: string;
  value: BigNumber;
  decimals: number;
  metadata: Record<string, unknown>;
}
