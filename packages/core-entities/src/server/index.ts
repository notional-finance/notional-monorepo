import { ConfigurationServer } from './configuration-server';
import { ExchangeRegistryServer } from './exchange-registry-server';
import { OracleRegistryServer } from './oracle-registry-server';
import { ServerRegistry } from './server-registry';
import { TokenRegistryServer } from './token-registry-server';

export const Servers = {
  ConfigurationServer: ConfigurationServer,
  ExchangeRegistryServer: ExchangeRegistryServer,
  OracleRegistryServer: OracleRegistryServer,
  TokenRegistryServer: TokenRegistryServer,
};
export type ServerRegistryConstructor<T> = new () => ServerRegistry<T>;
export type ServerRegistryClass = typeof ServerRegistry;
