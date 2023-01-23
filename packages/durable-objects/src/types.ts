import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { BigNumber } from 'ethers';

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

export interface ExchangeRatesDOEnv {
  EXCHANGE_RATE_DO: DurableObjectNamespace;
  WORKER_NAME: string;
}

export interface KPIsDOEnv {
  KPIsDO: DurableObjectNamespace;
  WORKER_NAME: string;
}
