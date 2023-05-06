import { Network, ONE_MINUTE_MS, ONE_SECOND_MS } from '@notional-finance/util';
import { ConfigurationClient } from './configuration/ConfigurationClient';
import defaultPools from './exchanges/DefaultPools';
import { ExchangeRegistryClient } from './exchanges/ExchangeRegistryClient';
import { OracleRegistryClient } from './oracles/OracleRegistryClient';
import { TokenRegistryClient } from './tokens/TokenRegistryClient';

export class Registry {
  protected static _tokens?: TokenRegistryClient;
  protected static _exchanges?: ExchangeRegistryClient;
  protected static _oracles?: OracleRegistryClient;
  protected static _configurations?: ConfigurationClient;

  public static DEFAULT_TOKEN_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_CONFIGURATION_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_EXCHANGE_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ORACLE_REFRESH = 10 * ONE_SECOND_MS;

  constructor(cacheHostname: string) {
    Registry._tokens = new TokenRegistryClient(cacheHostname);
    Registry._oracles = new OracleRegistryClient(cacheHostname);
    Registry._configurations = new ConfigurationClient(cacheHostname);
    Registry._exchanges = new ExchangeRegistryClient(cacheHostname);
  }

  public static startRefresh(network: Network) {
    Registry.getTokenRegistry().startRefreshInterval(
      network,
      Registry.DEFAULT_TOKEN_REFRESH
    );
    Registry.getOracleRegistry().startRefreshInterval(
      network,
      Registry.DEFAULT_ORACLE_REFRESH
    );
    Registry.getConfigurationRegistry().startRefreshInterval(
      network,
      Registry.DEFAULT_CONFIGURATION_REFRESH
    );

    // Prior to starting the exchange registry, register all the required tokens. When
    // reviving data from the cache host it will attempt to find these token definitions
    const tokenRegistry = Registry.getTokenRegistry();
    defaultPools[network].forEach((pool) =>
      pool.registerTokens.forEach(tokenRegistry.registerToken)
    );

    Registry.getExchangeRegistry().startRefreshInterval(
      network,
      Registry.DEFAULT_EXCHANGE_REFRESH
    );
  }

  public static stopRefresh(network: Network) {
    Registry.getTokenRegistry().stopRefresh(network);
    Registry.getExchangeRegistry().stopRefresh(network);
    Registry.getOracleRegistry().stopRefresh(network);
    Registry.getConfigurationRegistry().stopRefresh(network);
  }

  public static getTokenRegistry() {
    if (Registry._tokens == undefined) throw Error('Token Registry undefined');
    return Registry._tokens;
  }

  public static getExchangeRegistry() {
    if (Registry._exchanges == undefined)
      throw Error('Exchange Registry undefined');
    return Registry._exchanges;
  }

  public static getOracleRegistry() {
    if (Registry._oracles == undefined)
      throw Error('Oracle Registry undefined');
    return Registry._oracles;
  }

  public static getConfigurationRegistry() {
    if (Registry._configurations == undefined)
      throw Error('Oracle Registry undefined');
    return Registry._configurations;
  }
}
