import { AggregateCall } from '@notional-finance/multicall';
import {
  DurableObjectNamespace,
  ExecutionContext,
} from '@cloudflare/workers-types';
import { providers } from 'ethers';

export interface MonitorJob {
  run: (opts: JobOptions) => Promise<void>;
}

export interface JobMonitorEnv {
  EXCHANGE_RATE_STORE: DurableObjectNamespace;
  EXCHANGE_RATE_URL: string;
  EXCHANGE_RATES_WORKER_NAME: string;
  ALCHEMY_KEY: string;
  NX_DD_API_KEY: string;
  NX_DD_BASE_URL: string;
  VERSION: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
}

export interface JobOptions {
  request: Request;
  ctx: ExecutionContext;
  env: JobMonitorEnv;
}

export enum MonitorSchedule {
  EVERY_MINUTE = '* * * * *',
  EVERY_15_MINUTES = '*/15 * * * *',
  EVERY_HOUR = '0 * * * *',
}

export interface AggregateCallList {
  provider: providers.JsonRpcBatchProvider;
  calls: AggregateCall[];
}

export enum VolatilityType {
  STABLE = 'stable',
  VOLATILE = 'volatile',
}

export interface OracleContractConfig {
  key: string;
  address: string;
  decimals: number;
  volatilityType: VolatilityType;
}
