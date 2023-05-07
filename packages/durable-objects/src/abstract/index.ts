import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { BlockTriggerEvent } from 'defender-autotask-utils';
import { BigNumber } from 'ethers';
export * from './base-do';
export * from './registry-do';

export interface SentinelRequest {
  events: BlockTriggerEvent[];
}

export interface BaseDOEnv {
  NX_DD_API_KEY: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
  SERVICE_NAME: string;
  ALARM_CADENCE_MS: number | undefined;
}

export interface APIEnv extends BaseDOEnv {
  KPIS_DO: DurableObjectNamespace;
  EXCHANGE_RATES_DO: DurableObjectNamespace;
  YIELDS_DO: DurableObjectNamespace;
  KPIS_NAME: string;
  EXCHANGE_RATE_NAME: string;
  YIELDS_NAME: string;
  SENTINEL_ID: string;
  GHOST_ADMIN_KEY: string;
  NX_DD_API_KEY: string;
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
