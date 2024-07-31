import { R2Bucket } from '@cloudflare/workers-types';
import { Network } from '@notional-finance/util';

export { Logger, MetricType } from './logger';
export type { DDSeries, DDMetric } from './logger';
export { Servers, Routes } from '@notional-finance/core-entities/src/server';
export * from './registry-helpers';
export * from './views-helpers';

export interface APIEnv extends BaseDOEnv {
  GHOST_ADMIN_KEY: string;
  NX_DD_API_KEY: string;
  NX_DATA_URL: string;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  VIEWS_NAME: string;
  VIEW_CACHE_R2: R2Bucket;
  ACCOUNT_CACHE_R2: R2Bucket;
  NX_SUBGRAPH_API_KEY: string;
}
export interface BaseDOEnv {
  NX_DD_API_KEY: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
  NX_SUBGRAPH_API_KEY: string;
  VIEW_CACHE_R2: R2Bucket;
  VERSION: string;
  SUPPORTED_NETWORKS: Network[];
}
