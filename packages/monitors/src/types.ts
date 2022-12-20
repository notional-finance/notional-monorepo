import { AggregateCall } from '@notional-finance/multicall';
import { ExecutionContext } from '@cloudflare/workers-types';
import { providers } from 'ethers';

export interface MonitorJob {
  run: (opts: JobOptions) => Promise<void>;
}

export interface JobMonitorEnv {
  ALCHEMY_KEY: string;
  NX_DD_API_KEY: string;
  NX_DD_BASE_URL: string;
  VERSION: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
}

export interface JobOptions {
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
