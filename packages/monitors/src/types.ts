import { AggregateCall } from '@notional-finance/multicall';
import {
  DurableObjectNamespace,
  ExecutionContext,
} from '@cloudflare/workers-types';
import { providers } from 'ethers';
import { BigNumber } from 'ethers';

export interface MonitorJob {
  run: (opts: JobOptions) => Promise<void>;
}

export interface JobMonitorEnv {
  EXCHANGE_RATES_DO: DurableObjectNamespace;
  KPIS_DO: DurableObjectNamespace;
  EXCHANGE_RATES_NAME: string;
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

export interface VolumeKPI {
  total: BigNumber;
  lend: BigNumber;
  borrow: BigNumber;
}

export interface CurrencyVolumeKPI {
  usd: VolumeKPI;
  local: VolumeKPI;
}
