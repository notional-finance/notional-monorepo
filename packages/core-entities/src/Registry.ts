import { Network, ONE_MINUTE_MS, ONE_SECOND_MS } from '@notional-finance/util';
import { ConfigurationClient } from './client/configuration-client';
import defaultPools from './exchanges/default-pools';
import { ExchangeRegistryClient } from './client/exchange-registry-client';
import { OracleRegistryClient } from './client/oracle-registry-client';
import { TokenRegistryClient } from './client/token-registry-client';
import {
  AccountFetchMode,
  AccountRegistryClient,
} from './client/account-registry-client';
import { VaultRegistryClient } from './client/vault-registry-client';
import { YieldRegistryClient } from './client/yield-registry-client';

export class Registry {
  protected static _self?: Registry;
  protected static _tokens?: TokenRegistryClient;
  protected static _exchanges?: ExchangeRegistryClient;
  protected static _oracles?: OracleRegistryClient;
  protected static _configurations?: ConfigurationClient;
  protected static _vaults?: VaultRegistryClient;
  protected static _yields?: YieldRegistryClient;
  protected static _accounts?: AccountRegistryClient;

  public static DEFAULT_TOKEN_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_CONFIGURATION_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_EXCHANGE_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_VAULT_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ORACLE_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ACCOUNT_REFRESH = ONE_MINUTE_MS;

  static initialize(cacheHostname: string, fetchMode: AccountFetchMode) {
    if (Registry._self) return;

    Registry._self = new Registry(cacheHostname, fetchMode);
  }

  private constructor(
    protected _cacheHostname: string,
    fetchMode: AccountFetchMode
  ) {
    Registry._tokens = new TokenRegistryClient(_cacheHostname);
    Registry._oracles = new OracleRegistryClient(_cacheHostname);
    Registry._configurations = new ConfigurationClient(_cacheHostname);
    Registry._exchanges = new ExchangeRegistryClient(_cacheHostname);
    Registry._vaults = new VaultRegistryClient(_cacheHostname);
    Registry._accounts = new AccountRegistryClient(_cacheHostname, fetchMode);
    Registry._yields = new YieldRegistryClient(_cacheHostname);

    // Kicks off Fiat token refreshes
    Registry._tokens.startRefreshInterval(
      Network.All,
      Registry.DEFAULT_TOKEN_REFRESH
    );
    Registry._oracles.startRefreshInterval(
      Network.All,
      Registry.DEFAULT_ORACLE_REFRESH
    );
  }

  static get cacheHostname() {
    return Registry._self?._cacheHostname;
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

    // Prior to starting the exchange registry, register all the required tokens. When
    // reviving data from the cache host it will attempt to find these token definitions.
    // This has to be done in a callback to prevent race conditions when this registration
    // triggers the network to become registered prior to the token registry itself completing
    // its first refresh.
    const tokenRegistry = Registry.getTokenRegistry();
    tokenRegistry.onNetworkRegistered(network, () => {
      defaultPools[network].forEach((pool) =>
        pool.registerTokens.forEach((t) => tokenRegistry.registerToken(t))
      );

      Registry.getExchangeRegistry().startRefreshInterval(
        network,
        Registry.DEFAULT_EXCHANGE_REFRESH
      );

      Registry.getVaultRegistry().startRefreshInterval(
        network,
        Registry.DEFAULT_VAULT_REFRESH
      );

      Registry.getConfigurationRegistry().startRefreshInterval(
        network,
        Registry.DEFAULT_CONFIGURATION_REFRESH
      );
    });

    Registry.getAccountRegistry().startRefreshInterval(
      network,
      Registry.DEFAULT_ACCOUNT_REFRESH
    );
  }

  public static stopRefresh(network: Network) {
    Registry.getTokenRegistry().stopRefresh(network);
    Registry.getExchangeRegistry().stopRefresh(network);
    Registry.getOracleRegistry().stopRefresh(network);
    Registry.getConfigurationRegistry().stopRefresh(network);
    Registry.getAccountRegistry().stopRefresh(network);
    Registry.getVaultRegistry().stopRefresh(network);
  }

  public static isRefreshRunning(network: Network) {
    return (
      Registry.getTokenRegistry().isRefreshRunning(network) &&
      Registry.getExchangeRegistry().isRefreshRunning(network) &&
      Registry.getOracleRegistry().isRefreshRunning(network) &&
      Registry.getConfigurationRegistry().isRefreshRunning(network) &&
      Registry.getAccountRegistry().isRefreshRunning(network) &&
      Registry.getVaultRegistry().isRefreshRunning(network)
    );
  }

  public static getTokenRegistry() {
    if (Registry._tokens == undefined) throw Error('Token Registry undefined');
    return Registry._tokens;
  }

  public static getVaultRegistry() {
    if (Registry._vaults == undefined) throw Error('Vault Registry undefined');
    return Registry._vaults;
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
      throw Error('Configuration Registry undefined');
    return Registry._configurations;
  }

  public static getAccountRegistry() {
    if (Registry._accounts == undefined)
      throw Error('Account Registry undefined');
    return Registry._accounts;
  }

  public static getYieldRegistry() {
    if (Registry._yields == undefined) throw Error('Yield Registry undefined');
    return Registry._yields;
  }

  public static onNetworkReady(network: Network, fn: () => void) {
    Promise.all([
      new Promise<void>((r) =>
        Registry.getConfigurationRegistry().onNetworkRegistered(network, r)
      ),
      new Promise<void>((r) =>
        Registry.getTokenRegistry().onNetworkRegistered(network, r)
      ),
      new Promise<void>((r) =>
        Registry.getOracleRegistry().onNetworkRegistered(network, r)
      ),
      new Promise<void>((r) =>
        Registry.getExchangeRegistry().onNetworkRegistered(network, r)
      ),
      new Promise<void>((r) =>
        Registry.getVaultRegistry().onNetworkRegistered(network, r)
      ),
      new Promise<void>((r) => {
        const accounts = Registry.getAccountRegistry();
        // Resolve right away in single account mode since network won't register until
        // an active account is set.
        if (accounts.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) r();
        // Otherwise, resolve when all accounts have been loaded
        else accounts.onNetworkRegistered(network, r);
      }),
    ]).then(fn);
  }
}
