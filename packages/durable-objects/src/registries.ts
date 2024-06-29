import {
  DurableObjectNamespace,
  DurableObjectState,
} from '@cloudflare/workers-types';
import { Servers, Routes } from '@notional-finance/core-entities/src/server';
import { ONE_MINUTE_MS } from '@notional-finance/util';
import { BaseDOEnv, RegistryDO } from './abstract';

export interface RegistryDOEnv extends BaseDOEnv {
  TOKEN_REGISTRY_DO: DurableObjectNamespace;
  CONFIGURATION_REGISTRY_DO: DurableObjectNamespace;
  EXCHANGE_REGISTRY_DO: DurableObjectNamespace;
  ORACLE_REGISTRY_DO: DurableObjectNamespace;
  VAULT_REGISTRY_DO: DurableObjectNamespace;
}

export class TokenRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(
      state,
      env,
      2 * ONE_MINUTE_MS,
      Routes.Tokens,
      Servers.TokenRegistryServer
    );
  }
}

export class ConfigurationRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(
      state,
      env,
      2 * ONE_MINUTE_MS,
      Routes.Configuration,
      Servers.ConfigurationServer
    );
  }
}

export class ExchangeRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(
      state,
      env,
      ONE_MINUTE_MS,
      Routes.Exchanges,
      Servers.ExchangeRegistryServer
    );
  }
}

export class OracleRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(
      state,
      env,
      ONE_MINUTE_MS,
      Routes.Oracles,
      Servers.OracleRegistryServer
    );
  }

  override async healthcheck(): Promise<Response> {
    await this.onRefresh();

    return new Response('OK', { status: 200, statusText: 'OK' });
  }
}

export class VaultRegistryDO extends RegistryDO {
  constructor(state: DurableObjectState, env: BaseDOEnv) {
    super(state, env, undefined, Routes.Vaults, Servers.VaultRegistryServer);
  }

  override async healthcheck(): Promise<Response> {
    await this.onRefresh();

    return new Response('OK', { status: 200, statusText: 'OK' });
  }
}
