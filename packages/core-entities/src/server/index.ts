import { ConfigurationServer } from './configuration-server';
import { ExchangeRegistryServer } from './exchange-registry-server';
import { OracleRegistryServer } from './oracle-registry-server';
import { ServerRegistry } from './server-registry';
import { TokenRegistryServer } from './token-registry-server';
import { VaultRegistryServer } from './vault-registry-server';
import { AnalyticsServer } from './analytics-server';

export const Servers = {
  ConfigurationServer: ConfigurationServer,
  ExchangeRegistryServer: ExchangeRegistryServer,
  OracleRegistryServer: OracleRegistryServer,
  TokenRegistryServer: TokenRegistryServer,
  VaultRegistryServer: VaultRegistryServer,
  AnalyticsServer: AnalyticsServer,
};

export interface Env {
  NX_SUBGRAPH_API_KEY: string;
}

export type ServerRegistryConstructor<T> = new (e: Env) => ServerRegistry<T>;
export enum Routes {
  Configuration = 'configuration',
  Tokens = 'tokens',
  Oracles = 'oracles',
  Exchanges = 'exchanges',
  Vaults = 'vaults',
  Yields = 'yields',
  Accounts = 'accounts',
  Analytics = 'views',
}
