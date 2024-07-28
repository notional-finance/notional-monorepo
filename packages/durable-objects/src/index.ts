import { DurableObjectNamespace, R2Bucket } from '@cloudflare/workers-types';
import { Servers, Routes } from '@notional-finance/core-entities/src/server';
import { BaseDOEnv, RegistryDO } from './abstract';

export { Logger, MetricType } from './logger';
export type { DDSeries, DDMetric } from './logger';
export * from './abstract';

export class TokenRegistryDO extends RegistryDO {
  constructor(env: BaseDOEnv) {
    super(env, Routes.Tokens, Servers.TokenRegistryServer);
  }
}

export class ConfigurationRegistryDO extends RegistryDO {
  constructor(env: BaseDOEnv) {
    super(env, Routes.Configuration, Servers.ConfigurationServer);
  }
}

export class ExchangeRegistryDO extends RegistryDO {
  constructor(env: BaseDOEnv) {
    super(env, Routes.Exchanges, Servers.ExchangeRegistryServer);
  }
}

export class OracleRegistryDO extends RegistryDO {
  constructor(env: BaseDOEnv) {
    super(env, Routes.Oracles, Servers.OracleRegistryServer);
  }
}

export class VaultRegistryDO extends RegistryDO {
  constructor(env: BaseDOEnv) {
    super(env, Routes.Vaults, Servers.VaultRegistryServer);
  }
}

export interface APIEnv extends BaseDOEnv {
  GHOST_ADMIN_KEY: string;
  NX_DD_API_KEY: string;
  NX_DATA_URL: string;
  DATA_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  ACCOUNTS_REGISTRY_DO: DurableObjectNamespace;
  VIEWS_DO: DurableObjectNamespace;
  VIEWS_NAME: string;
  VIEW_CACHE_R2: R2Bucket;
  ACCOUNT_CACHE_R2: R2Bucket;
  NX_SUBGRAPH_API_KEY: string;
}
