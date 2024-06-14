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
import { AnalyticsRegistryClient } from './client/analytics-registry-client';
import { NOTERegistryClient } from './client/note-registry-client';

type Env = {
  NX_SUBGRAPH_API_KEY: string;
}

export class Registry {
  protected static _self?: Registry;
  protected static _tokens?: TokenRegistryClient;
  protected static _exchanges?: ExchangeRegistryClient;
  protected static _oracles?: OracleRegistryClient;
  protected static _configurations?: ConfigurationClient;
  protected static _vaults?: VaultRegistryClient;
  protected static _yields?: YieldRegistryClient;
  protected static _accounts?: AccountRegistryClient;
  protected static _analytics?: AnalyticsRegistryClient;
  protected static _note?: NOTERegistryClient;

  public static DEFAULT_TOKEN_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_CONFIGURATION_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_EXCHANGE_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_VAULT_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ORACLE_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ACCOUNT_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_YIELD_REFRESH = 10 * ONE_SECOND_MS;
  public static DEFAULT_ANALYTICS_REFRESH = 30 * ONE_MINUTE_MS;

  static initialize(
    env: Env,
    cacheHostname: string,
    fetchMode: AccountFetchMode,
    startFiatRefresh = true,
    useAnalytics = true,
    isClient = true
  ) {
    if (Registry._self) return;

    Registry._self = new Registry(
      env,
      cacheHostname,
      fetchMode,
      startFiatRefresh,
      useAnalytics,
      isClient
    );
  }

  protected constructor(
    env: Env,
    protected _cacheHostname: string,
    fetchMode: AccountFetchMode,
    startFiatRefresh: boolean,
    public useAnalytics: boolean,
    public isClient: boolean
  ) {
    Registry._tokens = new TokenRegistryClient(_cacheHostname);
    Registry._oracles = new OracleRegistryClient(_cacheHostname);
    Registry._configurations = new ConfigurationClient(_cacheHostname);
    Registry._exchanges = new ExchangeRegistryClient(_cacheHostname);
    Registry._vaults = new VaultRegistryClient(_cacheHostname);
    Registry._accounts = new AccountRegistryClient(_cacheHostname, fetchMode);
    Registry._yields = new YieldRegistryClient(_cacheHostname);
    Registry._analytics = new AnalyticsRegistryClient(_cacheHostname, env);
    Registry._note = new NOTERegistryClient(_cacheHostname);

    // Kicks off Fiat token refreshes
    if (startFiatRefresh) {
      Registry._tokens.startRefreshInterval(
        Network.all,
        Registry.DEFAULT_TOKEN_REFRESH
      );
      Registry._oracles.startRefreshInterval(
        Network.all,
        Registry.DEFAULT_ORACLE_REFRESH
      );
      if (useAnalytics) {
        Registry._analytics.startRefreshInterval(
          Network.all,
          Registry.DEFAULT_ANALYTICS_REFRESH
        );
      }
      if (isClient) {
        Registry._note.startRefreshInterval(
          Network.mainnet,
          Registry.DEFAULT_ANALYTICS_REFRESH
        );
      }
    }
  }

  static get cacheHostname() {
    return Registry._self?._cacheHostname;
  }

  protected static registerDefaultPoolTokens(network: Network) {
    const tokenRegistry = Registry.getTokenRegistry();
    defaultPools[network].forEach((pool) =>
      pool.registerTokens.forEach((t) => tokenRegistry.registerToken(t))
    );
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
      Registry.registerDefaultPoolTokens(network);

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

    // Only start the yield registry refresh after all the other refreshes begin
    if (this._self?.useAnalytics) {
      // Trigger the initial load via HTTP to bootstrap the data if running
      // on a client
      // if (this._self?.isClient) {
      //   Registry.getYieldRegistry().triggerHTTPRefresh(network);
      // }

      Registry.onNetworkReady(network, () => {
        Registry.getAnalyticsRegistry().startRefreshInterval(
          network,
          Registry.DEFAULT_ANALYTICS_REFRESH
        );

        Registry.getAnalyticsRegistry().onNetworkRegistered(network, () => {
          Registry.getYieldRegistry().startRefreshInterval(
            network,
            Registry.DEFAULT_YIELD_REFRESH
          );
        });
      });
    }
  }

  public static stopRefresh(network: Network) {
    Registry.getTokenRegistry().stopRefresh(network);
    Registry.getExchangeRegistry().stopRefresh(network);
    Registry.getOracleRegistry().stopRefresh(network);
    Registry.getConfigurationRegistry().stopRefresh(network);
    Registry.getAccountRegistry().stopRefresh(network);
    Registry.getVaultRegistry().stopRefresh(network);
    Registry.getYieldRegistry().stopRefresh(network);
    Registry.getAnalyticsRegistry().stopRefresh(network);
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

  public static async triggerRefresh(network: Network, blockNumber?: number) {
    await Promise.all([
      Registry.getTokenRegistry().triggerRefreshPromise(
        Network.all,
        blockNumber
      ),
      Registry.getOracleRegistry().triggerRefreshPromise(
        Network.all,
        blockNumber
      ),
      Registry.getTokenRegistry().triggerRefreshPromise(network, blockNumber),
      Registry.getOracleRegistry().triggerRefreshPromise(network, blockNumber),
    ]);
    Registry.registerDefaultPoolTokens(network);

    await Promise.all([
      Registry.getExchangeRegistry().triggerRefreshPromise(
        network,
        blockNumber
      ),
      Registry.getVaultRegistry().triggerRefreshPromise(network, blockNumber),
      Registry.getConfigurationRegistry().triggerRefreshPromise(
        network,
        blockNumber
      ),
    ]);

    // These cannot be grouped and have to proceed one at a time
    await Registry.getAccountRegistry().triggerRefreshPromise(
      network,
      blockNumber
    );
    await Registry.getAnalyticsRegistry().triggerRefreshPromise(
      network,
      blockNumber
    );
    await Registry.getYieldRegistry().triggerRefreshPromise(
      network,
      blockNumber
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

  public static getAnalyticsRegistry() {
    if (Registry._analytics == undefined)
      throw Error('Analytics Registry undefined');
    return Registry._analytics;
  }

  public static getNOTERegistry() {
    if (Registry._note == undefined) throw Error('NOTE Registry undefined');
    return Registry._note;
  }

  public static onNetworkReady(network: Network, fn: () => void) {
    if (network === Network.all) {
      Promise.all([
        new Promise<void>((r) =>
          Registry.getTokenRegistry().onNetworkRegistered(network, r)
        ),
        new Promise<void>((r) =>
          Registry.getOracleRegistry().onNetworkRegistered(network, r)
        ),
        new Promise<void>((r) =>
          Registry.getAnalyticsRegistry().onNetworkRegistered(network, r)
        ),
      ]).then(fn);
    } else {
      // NOTE: yield registry and analytics registry is not included in here or
      // it will create a circular dependency.
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
          if (accounts.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT)
            r();
          // Otherwise, resolve when all accounts have been loaded
          else accounts.onNetworkRegistered(network, r);
        }),
      ]).then(fn);
    }
  }
}
