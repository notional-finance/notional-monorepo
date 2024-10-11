import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { ConfigurationClient } from './client/configuration-client';
import defaultPools from './exchanges/default-pools';
import { TokenRegistryClient } from './client/token-registry-client';
import {
  AccountFetchMode,
  AccountRegistryClient,
} from './client/account-registry-client';

type Env = {
  NX_SUBGRAPH_API_KEY: string;
};

export class Registry {
  protected static _self?: Registry;
  protected static _tokens?: TokenRegistryClient;
  protected static _configurations?: ConfigurationClient;
  protected static _accounts?: AccountRegistryClient;

  public static DEFAULT_TOKEN_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_CONFIGURATION_REFRESH = 20 * ONE_MINUTE_MS;
  public static DEFAULT_EXCHANGE_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_VAULT_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_ORACLE_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_ACCOUNT_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_YIELD_REFRESH = ONE_MINUTE_MS;
  public static DEFAULT_ANALYTICS_REFRESH = 30 * ONE_MINUTE_MS;

  static initialize(
    env: Env,
    cacheHostname: string,
    fetchMode: AccountFetchMode,
    startFiatRefresh = true,
    useAnalytics = false,
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
    Registry._configurations = new ConfigurationClient(_cacheHostname);
    Registry._accounts = new AccountRegistryClient(_cacheHostname, fetchMode);
    Registry._accounts.setSubgraphAPIKey = env.NX_SUBGRAPH_API_KEY;

    // Kicks off Fiat token refreshes
    if (startFiatRefresh) {
      Registry._tokens.startRefreshInterval(
        Network.all,
        Registry.DEFAULT_TOKEN_REFRESH
      );
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

    // Prior to starting the exchange registry, register all the required tokens. When
    // reviving data from the cache host it will attempt to find these token definitions.
    // This has to be done in a callback to prevent race conditions when this registration
    // triggers the network to become registered prior to the token registry itself completing
    // its first refresh.
    const tokenRegistry = Registry.getTokenRegistry();
    tokenRegistry.onNetworkRegistered(network, () => {
      Registry.registerDefaultPoolTokens(network);

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
    Registry.getConfigurationRegistry().stopRefresh(network);
    Registry.getAccountRegistry().stopRefresh(network);
  }

  public static isRefreshRunning(network: Network) {
    return (
      Registry.getTokenRegistry().isRefreshRunning(network) &&
      Registry.getConfigurationRegistry().isRefreshRunning(network) &&
      Registry.getAccountRegistry().isRefreshRunning(network)
    );
  }

  public static async triggerRefresh(network: Network, blockNumber?: number) {
    await Promise.all([
      Registry.getTokenRegistry().triggerRefreshPromise(
        Network.all,
        blockNumber
      ),
      Registry.getTokenRegistry().triggerRefreshPromise(network, blockNumber),
    ]);
    Registry.registerDefaultPoolTokens(network);

    await Promise.all([
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
  }

  public static getTokenRegistry() {
    if (Registry._tokens == undefined) throw Error('Token Registry undefined');
    return Registry._tokens;
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

  public static async onNetworkReady(network: Network, fn: () => void) {
    if (network === Network.all) {
      Promise.all([
        new Promise<void>((r) =>
          Registry.getTokenRegistry().onNetworkRegistered(network, r)
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
