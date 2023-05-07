import {
  DurableObjectNamespace,
  DurableObjectState,
} from '@cloudflare/workers-types';
import { Servers } from '@notional-finance/core-entities';
import { ONE_MINUTE_MS } from '@notional-finance/util';
import { BaseDOEnv, RegistryDO } from './abstract';

export interface RegistryDOEnv extends BaseDOEnv {
  TOKEN_REGISTRY_DO: DurableObjectNamespace;
  CONFIGURATION_REGISTRY_DO: DurableObjectNamespace;
  EXCHANGE_REGISTRY_DO: DurableObjectNamespace;
  ORACLE_REGISTRY_DO: DurableObjectNamespace;
}

export class TokenRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(state, env, 20 * ONE_MINUTE_MS, Servers.TokenRegistryServer);
  }
}

export class ConfigurationRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(state, env, 20 * ONE_MINUTE_MS, Servers.ConfigurationServer);
  }
}

export class ExchangeRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(state, env, ONE_MINUTE_MS, Servers.ExchangeRegistryServer);
  }
}

export class OracleRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(state, env, ONE_MINUTE_MS, Servers.OracleRegistryServer);
  }
}
