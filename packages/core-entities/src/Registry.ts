import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import defaultPools from './exchanges/default-pools';
import { TokenRegistryClient } from './client/token-registry-client';
import { AccountFetchMode } from './client/account-registry-client';

type Env = {
  NX_SUBGRAPH_API_KEY: string;
};

export class Registry {
  protected static _self?: Registry;
  protected static _tokens?: TokenRegistryClient;

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
    protected _env: Env,
    protected _cacheHostname: string,
    protected _fetchMode: AccountFetchMode,
    startFiatRefresh: boolean,
    public useAnalytics: boolean,
    public isClient: boolean
  ) {
    Registry._tokens = new TokenRegistryClient(_cacheHostname);

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
    });
  }

  public static stopRefresh(network: Network) {
    Registry.getTokenRegistry().stopRefresh(network);
  }

  public static isRefreshRunning(network: Network) {
    return Registry.getTokenRegistry().isRefreshRunning(network);
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
  }

  public static getTokenRegistry() {
    if (Registry._tokens == undefined) throw Error('Token Registry undefined');
    return Registry._tokens;
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
          Registry.getTokenRegistry().onNetworkRegistered(network, r)
        ),
      ]).then(fn);
    }
  }
}
