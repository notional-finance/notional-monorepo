import { SCALAR_PRECISION, Network } from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { combineLatest, map, of, Subscription, withLatestFrom } from 'rxjs';
import { ExchangeRate, OracleDefinition } from '../definitions';
import { ClientRegistry } from '../registry/client-registry';
import { OracleRegistryServer } from '../server/oracle-registry-server';

// type OracleSubject = BehaviorSubject<ExchangeRate | null>;
type AdjList = Map<string, Set<string>>;

export class OracleRegistryClient extends ClientRegistry<OracleDefinition> {
  protected cachePath = OracleRegistryServer.CachePath;

  protected adjLists = new Map<Network, AdjList>();
  private _adjListSubscription: Subscription;

  constructor(cacheHostname: string) {
    super(cacheHostname);

    this._adjListSubscription = this.subjectRegistered
      .asObservable()
      .subscribe((subjectKey) => {
        if (subjectKey) {
          // Builds the adjacency list as new subjects are registered
          const { network, key } = subjectKey;
          const networkList =
            this.adjLists.get(network) || new Map<string, Set<string>>();
          const oracle = this.getLatestFromSubject(network, key);
          if (!oracle) throw Error('Oracle undefined');

          const quoteToBase =
            networkList.get(oracle.quote) || new Set<string>();
          quoteToBase.add(oracle.base);
          networkList.set(oracle.quote, quoteToBase);

          const baseToQuote = networkList.get(oracle.base) || new Set<string>();
          baseToQuote.add(oracle.quote);
          networkList.set(oracle.base, baseToQuote);
        }
      });
  }

  public destroy() {
    this._adjListSubscription.unsubscribe();
  }

  public isManipulationResistant(_oracle: OracleDefinition) {
    // All current oracle types are manipulation resistant
    return true;
  }

  /** Finds a path from base to quote via the adjacency list */
  public findPath(base: string, quote: string, network: Network) {
    const adjList = this.adjLists.get(network);
    if (!adjList) throw Error(`Adjacency list not found for ${network}`);
    if (base === quote) throw Error(`Invalid exchange rate ${base}/${quote}`);

    let path = [base];
    const queue = [path];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (!currentPath || currentPath.length === 0) continue;

      const lastID = currentPath[currentPath.length - 1];
      // If the last symbol of the path is the base then quit
      if (lastID === quote) {
        path = currentPath;
        break;
      }

      // Loop into nodes linked to the last symbol
      Array.from(adjList.get(lastID)?.values() || []).forEach((id) => {
        // Check if the current path includes the symbol, if it does then skip adding it
        if (!currentPath.includes(id)) queue.push([...currentPath, id]);
      });
    }

    // This ensures there are at least 2 entries in the path since base !== quote
    if (path[path.length - 1] !== quote)
      throw Error(`Path from ${base} to ${quote} not found`);

    return path;
  }

  /** Returns an array of observables from a path */
  protected getObservablesFromPath(network: Network, path: string[]) {
    const subjects = this._getNetworkSubjects(network);
    const adjList = this.adjLists.get(network);
    if (!adjList) throw Error(`Adjacency list not found for ${network}`);

    return path.map((id, i) => {
      const inverted = i > 0 && adjList.get(id)?.has(path[i - 1]) === false;
      const observable = subjects.get(id)?.asObservable();
      if (!observable) throw Error(`Update Subject for ${id} not found`);

      return observable.pipe(
        map((r: OracleDefinition | null) => {
          if (r && inverted) {
            // Invert and scale to 18 decimals:
            // (r.decimals * 2 + 18 - r.decimals) = r.decimals + 18
            const num = BigNumber.from(10).pow(r.decimals + 18);
            return {
              ...r.latestRate,
              rate: num.div(r.latestRate.rate),
            };
          } else if (r?.decimals && r.decimals < 18) {
            // Scale to 18 decimals:
            // mul 10 ^ (18 - r.decimals)
            return {
              ...r.latestRate,
              rate: r.latestRate.rate.mul(
                BigNumber.from(10).pow(18 - r.decimals)
              ),
            };
          } else if (r?.decimals && r?.decimals > 18) {
            // Scale to 18 decimals:
            return {
              ...r.latestRate,
              rate: r.latestRate.rate.div(
                BigNumber.from(10).pow(r.decimals - 18)
              ),
            };
          }

          return r?.latestRate;
        })
      );
    });
  }

  public getLatestFromPath(
    network: Network,
    path: string[]
  ): ExchangeRate | null {
    const observables = this.getObservablesFromPath(network, path);
    let latestRate: ExchangeRate | null = null;

    of(1)
      .pipe(
        withLatestFrom(...observables),
        map(([, ...rates]) => this.combineRates(rates))
      )
      .forEach((v) => {
        latestRate = v;
      });

    return latestRate;
  }

  public subscribeToPath(network: Network, oraclePath: string[]) {
    const observables = this.getObservablesFromPath(network, oraclePath);
    return combineLatest(observables).pipe(
      map((rates) => this.combineRates(rates))
    );
  }

  private combineRates(rates: (ExchangeRate | undefined)[]) {
    if (rates.length === 0) return null;

    const rate = rates.reduce(
      (p, er) => (er && p ? p.mul(er.rate).div(SCALAR_PRECISION) : null),
      BigNumber.from(SCALAR_PRECISION) as BigNumber | null
    );

    const timestamp = Math.min(...rates.map((r) => r?.timestamp || 0));
    const blockNumber = Math.min(...rates.map((r) => r?.blockNumber || 0));

    return rate ? { rate, timestamp, blockNumber } : null;
  }
}
