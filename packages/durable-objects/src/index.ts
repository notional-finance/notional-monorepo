import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { RegistryDOEnv } from './registries';

export * from './kpis-do';
export * from './abstract';
export * from './accounts-do';

export interface APIEnv extends RegistryDOEnv {
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
