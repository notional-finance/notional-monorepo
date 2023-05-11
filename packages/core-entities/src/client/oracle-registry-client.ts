import {
  SCALAR_PRECISION,
  Network,
  SCALAR_DECIMALS,
  decodeERC1155Id,
  getNowSeconds,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
} from '@notional-finance/util';
import { BigNumber, utils } from 'ethers';
import { combineLatest, map, of, Subscription, withLatestFrom } from 'rxjs';
import { ExchangeRate, OracleDefinition } from '../definitions';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';

interface Node {
  id: string;
  inverted: boolean;
}
type AdjList = Map<string, Map<string, Node>>;

export class OracleRegistryClient extends ClientRegistry<OracleDefinition> {
  protected cachePath = Routes.Oracles;

  protected adjLists = new Map<Network, AdjList>();
  private _adjListSubscription: Subscription;

  /** Rate equal to one unit in 18 decimal precision with an arbitrary future timestamp */
  private _unitRate$ = of({
    rate: SCALAR_PRECISION,
    timestamp: 2 ** 32,
    blockNumber: 2 ** 32,
  });

  constructor(cacheHostname: string) {
    super(cacheHostname);

    this._adjListSubscription = this.subjectRegistered
      .asObservable()
      .subscribe((subjectKey) => {
        if (subjectKey) {
          // Builds the adjacency list as new subjects are registered
          const { network, key } = subjectKey;
          const networkList =
            this.adjLists.get(network) || new Map<string, Map<string, Node>>();
          const oracle = this.getLatestFromSubject(network, key, 0);
          if (!oracle) throw Error('Oracle undefined');

          // TODO: fcash rates there are two versions...
          const quoteToBase =
            networkList.get(oracle.quote) || new Map<string, Node>();
          quoteToBase.set(oracle.base, {
            id: oracle.id,
            inverted: false,
          });

          const baseToQuote =
            networkList.get(oracle.base) || new Map<string, Node>();
          baseToQuote.set(oracle.quote, {
            id: oracle.id,
            inverted: true,
          });

          networkList.set(oracle.quote, quoteToBase);
          networkList.set(oracle.base, baseToQuote);
          this.adjLists.set(network, networkList);
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
      Array.from(adjList.get(lastID)?.keys() || []).forEach((id) => {
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
      if (i == 0) return this._unitRate$;

      const node = adjList.get(id)?.get(path[i - 1]);
      if (!node) throw Error(`${id} node is not found`);

      const observable = subjects.get(node.id)?.asObservable();
      if (!observable) throw Error(`Update Subject for ${node.id} not found`);

      return observable.pipe(
        map((r: OracleDefinition | null) => {
          // fCash rates are interest rates so convert them to exchange rates in SCALAR_PRECISION here
          if (
            r?.oracleType === 'fCashOracleRate' ||
            r?.oracleType === 'fCashSpotRate'
          ) {
            const { maturity } = decodeERC1155Id(r.quote);
            const exchangeRate = this.interestToExchangeRate(
              r.latestRate.rate,
              maturity
            );

            return node.inverted
              ? this.invertRate({
                  ...r.latestRate,
                  rate: exchangeRate,
                })
              : { ...r.latestRate, rate: exchangeRate };
          }

          if (r && node.inverted) {
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

  invertRate(rate: ExchangeRate) {
    return {
      ...rate,
      rate: SCALAR_PRECISION.mul(SCALAR_PRECISION).div(rate.rate),
    };
  }

  formatString(rate: ExchangeRate) {
    return utils.formatUnits(rate.rate, SCALAR_DECIMALS);
  }

  formatNumber(rate: ExchangeRate) {
    return parseFloat(utils.formatUnits(rate.rate, SCALAR_DECIMALS));
  }

  interestToExchangeRate(
    interestRate: BigNumber,
    maturity: number,
    currentTime = getNowSeconds()
  ) {
    if (maturity <= currentTime) return SCALAR_PRECISION;

    // exchange rate = e ^ (rt)
    return BigNumber.from(
      Math.floor(
        Math.exp(
          (interestRate.toNumber() * (maturity - currentTime)) /
            (SECONDS_IN_YEAR * RATE_PRECISION)
        ) * RATE_PRECISION
      )
    ).mul(RATE_PRECISION);
  }

  exchangeToInterestRate(
    exchangeRate: BigNumber,
    maturity: number,
    currentTime = getNowSeconds()
  ) {
    if (maturity <= currentTime) return 0;

    const timeToMaturity = maturity - currentTime
    // interest rate = ln(exchangeRate) * SECONDS_IN_YEAR / timeToMaturity
    const annualRate =
      ((Math.log(exchangeRate.toNumber() / RATE_PRECISION) * SECONDS_IN_YEAR) /
        timeToMaturity) *
      RATE_PRECISION;
    return Math.trunc(annualRate);
  }
}
