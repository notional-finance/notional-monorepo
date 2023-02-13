import { BigNumber, Contract, ethers } from 'ethers';
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  Subject,
  withLatestFrom,
} from 'rxjs';
import {
  AssetRateAggregatorABI,
  IAggregator,
  IAggregatorABI,
} from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import defaultOracles from './DefaultOracles';
import {
  ExchangeRate,
  Network,
  OracleDefinition,
  OracleInterface,
} from '../Definitions';
import {
  RATE_PRECISION,
  RATE_PRECISION_SQUARED,
} from '@notional-finance/sdk/config/constants';
import { getNowSeconds } from '@notional-finance/util';

type OracleSubject = BehaviorSubject<ExchangeRate | undefined>;
type AdjList = Map<string, Set<string>>;

interface OracleGraph {
  adjList: AdjList;
  oracles: Map<string, OracleDefinition[]>;
  subjects: Map<string, OracleSubject>;
}

interface OraclePath {
  key: string;
  oracleIndex: number;
  mustInvert: boolean;
}

export class OracleRegistry {
  protected static lastUpdateBlock = new Map<
    Network,
    BehaviorSubject<number>
  >();

  protected static lastUpdateTimestamp = new Map<
    Network,
    BehaviorSubject<number>
  >();

  protected static oracleGraphs = new Map<Network, OracleGraph>(
    defaultOracles.map(([n, _oracles]) => {
      // Initializes the oracle graph using the default oracles
      const adjList = new Map<string, Set<string>>();
      const oracles = new Map<string, OracleDefinition[]>();
      const subjects = new Map<string, OracleSubject>();

      _oracles.forEach((o) => {
        this.addOracle(o, adjList, oracles, subjects);
      });

      // Reset the last update block to zero
      this.lastUpdateBlock.set(n, new BehaviorSubject<number>(0));

      return [n, { oracles, adjList, subjects }];
    })
  );

  protected static addOracle(
    o: OracleDefinition,
    adjList: AdjList,
    oracles: Map<string, OracleDefinition[]>,
    subjects: Map<string, OracleSubject>
  ) {
    const quoteToBase = adjList.get(o.quote) || new Set<string>();
    quoteToBase.add(o.base);
    adjList.set(o.quote, quoteToBase);

    const baseToQuote = adjList.get(o.base) || new Set<string>();
    baseToQuote.add(o.quote);
    adjList.set(o.base, baseToQuote);

    const key = this.getOracleKey(o);
    oracles.set(key, (oracles.get(key) || []).concat(o));

    // Index Key is always defined here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const index = oracles.get(key)!.length - 1;
    const indexKey = this.getOracleKey(o, index);
    subjects.set(
      indexKey,
      new BehaviorSubject<ExchangeRate | undefined>(undefined)
    );
  }

  public static getOracleKey(o: OracleDefinition, oracleIndex?: number) {
    return oracleIndex !== undefined
      ? `${o.base}/${o.quote}:${oracleIndex}`
      : `${o.base}/${o.quote}`;
  }

  public static getOracleGraph(network: Network) {
    const oracleGraph = this.oracleGraphs.get(network);
    if (!oracleGraph) throw Error(`Oracle Graph not found for ${network}`);
    return oracleGraph;
  }

  public static isManipulationResistant(oracleInterface: OracleInterface) {
    return (
      oracleInterface === OracleInterface.Chainlink ||
      oracleInterface === OracleInterface.CompoundV2_cToken ||
      oracleInterface === OracleInterface.Notional_InterestRate ||
      oracleInterface === OracleInterface.Notional_VaultOracle
    );
  }

  public static registerOracle(network: Network, oracle: OracleDefinition) {
    const {
      adjList: oracleAdjList,
      oracles,
      subjects,
    } = this.getOracleGraph(network);
    this.addOracle(oracle, oracleAdjList, oracles, subjects);
  }

  public static getAggregateCall(
    key: string,
    oracle: OracleDefinition,
    provider: ethers.providers.Provider
  ): AggregateCall {
    // All oracles are transformed into RATE_PRECISION decimal places
    const defaultScale = (
      result: BigNumber,
      validTimestamp: number = getNowSeconds()
    ): ExchangeRate => {
      const decimals = BigNumber.from(10).pow(oracle.decimalPlaces);
      return {
        rate: result.mul(RATE_PRECISION).div(decimals),
        base: oracle.base,
        quote: oracle.quote,
        validTimestamp,
      };
    };

    switch (oracle.oracleInterface) {
      case OracleInterface.Chainlink:
        return {
          key,
          target: new Contract(oracle.address, IAggregatorABI, provider),
          method: 'latestRoundData',
          args: [],
          transform: (
            r: Awaited<ReturnType<IAggregator['functions']['latestRoundData']>>
          ) => defaultScale(r.answer, r.updatedAt.toNumber()),
        };

      case OracleInterface.CompoundV2_cToken:
        return {
          key,
          target: new Contract(
            oracle.address,
            AssetRateAggregatorABI,
            provider
          ),
          method: 'getExchangeRateView',
          args: [],
          transform: (r: BigNumber) => defaultScale(r),
        };

      default:
        throw Error('Unsupported Oracle');
    }
  }

  public static getAggregateMulticallData(
    network: Network,
    provider: ethers.providers.Provider
  ): AggregateCall[] {
    const { oracles } = this.getOracleGraph(network);
    return Array.from(oracles.values()).flatMap((oracleList) =>
      oracleList.map((o, i) =>
        this.getAggregateCall(this.getOracleKey(o, i), o, provider)
      )
    );
  }

  public static async fetchOracleData(
    network: Network,
    provider: ethers.providers.Provider
  ) {
    const aggregateCall = this.getAggregateMulticallData(network, provider);
    const { subjects } = this.getOracleGraph(network);
    const { block, results } = await aggregate<Record<string, ExchangeRate>>(
      aggregateCall,
      provider,
      // This will call next() on all the update subjects
      subjects as Map<string, Subject<unknown>>
    );

    // TODO: also update timestamp here
    this.lastUpdateBlock.get(network)?.next(block.number);
    this.lastUpdateTimestamp.get(network)?.next(block.timestamp);

    return { blockNumber: block.number, results };
  }

  // public static async fetchFromCache(_cacheUrl: string) {}

  protected static breadthFirstSearch(
    base: string,
    quote: string,
    adjList: AdjList
  ) {
    if (base === quote) throw Error(`Invalid exchange rate ${base}/${quote}`);

    let path = [base];
    const queue = [path];

    while (queue.length > 0) {
      const currentPath = queue.shift();
      if (!currentPath || currentPath.length === 0) continue;

      const lastSymbol = currentPath[currentPath.length - 1];
      // If the last symbol of the path is the base then quit
      if (lastSymbol === quote) {
        path = currentPath;
        break;
      }

      // Loop into nodes linked to the last symbol
      Array.from(adjList.get(lastSymbol)?.values() || []).forEach((s) => {
        // Check if the current path includes the symbol, if it does then skip adding it
        if (!currentPath.includes(s)) queue.push([...currentPath, s]);
      });
    }

    // This ensures there are at least 2 entries in the path since base !== quote
    if (path[path.length - 1] !== quote)
      throw Error(`Path from ${base} to ${quote} not found`);

    return path;
  }

  public static findPath(
    base: string,
    quote: string,
    network: Network,
    onlyManipulationResistant = true
  ) {
    // TODO: switch on only manipulation resistant oracles
    const { adjList, oracles } = this.getOracleGraph(network);
    const path = this.breadthFirstSearch(base, quote, adjList);

    return path.reduce((p, c, i) => {
      if (i === 0) return p;

      let key = `${path[i - 1]}/${c}`;
      let mustInvert = false;
      let oracleIndex = oracles
        .get(key)
        ?.findIndex((o) =>
          onlyManipulationResistant
            ? this.isManipulationResistant(o.oracleInterface)
            : true
        );

      if (oracleIndex === undefined || oracleIndex < 0) {
        key = `${c}/${path[i - 1]}`;
        mustInvert = true;
        oracleIndex = oracles
          .get(key)
          ?.findIndex((o) =>
            onlyManipulationResistant
              ? this.isManipulationResistant(o.oracleInterface)
              : true
          );
      }

      if (oracleIndex === undefined || oracleIndex < 0)
        throw Error(`No oracle found for ${key}`);
      p.push({ key, oracleIndex, mustInvert });
      return p;
    }, [] as OraclePath[]);
  }

  /**
   * @param network
   * @param oraclePath
   * @returns an array of observables that represents the path
   */
  protected static getObservablesFromPath(
    network: Network,
    oraclePath: OraclePath[]
  ) {
    const { subjects } = this.getOracleGraph(network);
    return oraclePath.map(({ key, oracleIndex, mustInvert }) => {
      const observable = subjects.get(`${key}:${oracleIndex}`)?.asObservable();
      if (!observable)
        throw Error(`Update Subject for ${key}:${oracleIndex} not found`);

      return mustInvert
        ? observable.pipe(
            map((r: ExchangeRate | undefined) => {
              if (r) {
                return {
                  // Invert the base and quote
                  base: r.quote,
                  quote: r.base,
                  rate: RATE_PRECISION_SQUARED.div(r.rate),
                  validTimestamp: r.validTimestamp,
                };
              }

              return undefined;
            })
          )
        : observable;
    });
  }

  private static combineRates(rates: (ExchangeRate | undefined)[]) {
    if (rates.length === 0) return undefined;

    const base = rates[0]?.base;
    const quote = rates[rates.length - 1]?.quote;

    const rate = rates.reduce(
      (p, er) => (er && p ? p.mul(er.rate).div(RATE_PRECISION) : undefined),
      BigNumber.from(RATE_PRECISION) as BigNumber | undefined
    );

    const validTimestamp = Math.min(
      ...rates.map((r) => r?.validTimestamp || 0)
    );

    return rate && base && quote
      ? { base, quote, rate, validTimestamp }
      : undefined;
  }

  public static getLatestFromPath(network: Network, oraclePath: OraclePath[]) {
    const observables = this.getObservablesFromPath(network, oraclePath);
    let latestRate: ExchangeRate | undefined;

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

  public static subscribeToPath(network: Network, oraclePath: OraclePath[]) {
    const observables = this.getObservablesFromPath(network, oraclePath);
    return combineLatest(observables).pipe(
      map((rates) => this.combineRates(rates))
    );
  }

  public static getLatestFromOracle(network: Network, oracleIndexKey: string) {
    const { subjects } = this.getOracleGraph(network);
    const s = subjects.get(oracleIndexKey);
    if (!s)
      throw Error(
        `Oracle Index Key: ${oracleIndexKey} not found on network ${network}`
      );
    return s.value;
  }

  public static subscribeToOracle(network: Network, oracleIndexKey: string) {
    const { subjects } = this.getOracleGraph(network);
    const s = subjects.get(oracleIndexKey);
    if (!s)
      throw Error(
        `Oracle Index Key: ${oracleIndexKey} not found on network ${network}`
      );
    // shareReplay ensures that the latest results trigger the observable
    return s.asObservable();
  }

  public static getLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.value || 0;
  }

  public static subscribeLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.asObservable();
  }

  public static getLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.value || 0;
  }

  public static subscribeLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.asObservable();
  }
}
