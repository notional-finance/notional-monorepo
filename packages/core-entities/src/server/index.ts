import { ConfigurationServer } from './configuration-server';
import { ExchangeRegistryServer } from './exchange-registry-server';
import { OracleRegistryServer } from './oracle-registry-server';
import { ServerRegistry } from './server-registry';
import { TokenRegistryServer } from './token-registry-server';
import { VaultRegistryServer } from './vault-registry-server';

export const Servers = {
  ConfigurationServer: ConfigurationServer,
  ExchangeRegistryServer: ExchangeRegistryServer,
  OracleRegistryServer: OracleRegistryServer,
  TokenRegistryServer: TokenRegistryServer,
  VaultRegistryServer: VaultRegistryServer,
};

export type ServerRegistryConstructor<T> = new () => ServerRegistry<T>;
export enum Routes {
  Configuration = 'configuration',
  Tokens = 'tokens',
  Oracles = 'oracles',
  Exchanges = 'exchanges',
  Accounts = 'accounts',
  Vaults = 'vaults',
  Yields = 'yields',
}
