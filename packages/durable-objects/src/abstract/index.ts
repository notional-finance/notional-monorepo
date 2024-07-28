import { R2Bucket } from '@cloudflare/workers-types';
import { Network } from '@notional-finance/util';
import { BlockTriggerEvent } from 'defender-autotask-utils';
export * from './base-do';
export * from './registry-do';
export * from './views-do';

export interface SentinelRequest {
  events: BlockTriggerEvent[];
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
