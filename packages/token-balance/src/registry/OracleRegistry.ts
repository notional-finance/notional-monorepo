import { BigNumber, Contract, ethers } from 'ethers';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  AssetRateAggregatorABI,
  IAggregatorABI,
} from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import defaultOracles from './DefaultOracles';
import { Network, OracleDefinition, OracleInterface } from './Definitions';

// Exchange rate graph is quote => base since there are fewer quote
// currencies that we deal with versus many base currencies
type Quote = string;
type Base = string;
type OracleSubject = BehaviorSubject<BigNumber | undefined>;
type AdjList = Map<Quote, Set<Base>>;

interface OracleGraph {
  baseQuoteAdjList: AdjList;
  oracles: Map<string, OracleDefinition[]>;
  subjects: Map<string, OracleSubject>;
}

export class OracleRegistry {
  protected static lastUpdateBlock = new Map<
    Network,
    BehaviorSubject<number>
  >();

  protected static oracleGraphs = new Map<Network, OracleGraph>(
    defaultOracles.map(([n, _oracles]) => {
      // Initializes the oracle graph using the default oracles
      const baseQuoteAdjList = new Map<Quote, Set<Base>>();
      const oracles = new Map<string, OracleDefinition[]>();
      const subjects = new Map<string, OracleSubject>();

      _oracles.forEach((o) => {
        this.addOracle(o, baseQuoteAdjList, oracles, subjects);
      });

      // Reset the last update block to zero
      this.lastUpdateBlock.set(n, new BehaviorSubject<number>(0));

      return [n, { oracles, baseQuoteAdjList, subjects }];
    })
  );

  protected static addOracle(
    o: OracleDefinition,
    adjList: AdjList,
    oracles: Map<string, OracleDefinition[]>,
    subjects: Map<string, OracleSubject>
  ) {
    const bases = adjList.get(o.quote) || new Set<Base>();
    bases.add(o.base);
    adjList.set(o.quote, bases);

    const key = this.getOracleKey(o);
    oracles.set(key, (oracles.get(key) || []).concat(o));

    // Index Key is always defined here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const index = oracles.get(key)!.length - 1;
    const indexKey = this.getOracleKey(o, index);
    subjects.set(
      indexKey,
      new BehaviorSubject<BigNumber | undefined>(undefined)
    );
  }

  public static getOracleKey(o: OracleDefinition, oracleIndex?: number) {
    return oracleIndex
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
    const { baseQuoteAdjList, oracles, subjects } =
      this.getOracleGraph(network);
    this.addOracle(oracle, baseQuoteAdjList, oracles, subjects);
  }

  public static getAggregateCall(oracle: OracleDefinition) {
    switch (oracle.oracleInterface) {
      case OracleInterface.Chainlink:
        return {
          target: new Contract(oracle.address, IAggregatorABI),
          method: 'latestAnswer',
          args: [],
        };

      case OracleInterface.CompoundV2_cToken:
        return {
          target: new Contract(oracle.address, AssetRateAggregatorABI),
          method: 'getExchangeRateView',
          args: [],
        };

      default:
        throw Error('Unsupported Oracle');
    }
  }

  public static getAggregateMulticallData(network: Network): AggregateCall[] {
    const { oracles } = this.getOracleGraph(network);
    return Array.from(oracles.values())
      .flat()
      .map((o, i) => {
        const key = this.getOracleKey(o, i);
        return Object.assign({ key }, this.getAggregateCall(o));
      });
  }

  public static async fetchOracleData(
    network: Network,
    provider: ethers.providers.Provider
  ) {
    const aggregateCall = this.getAggregateMulticallData(network);
    const { subjects } = this.getOracleGraph(network);
    const { blockNumber, results } = await aggregate<Record<string, BigNumber>>(
      aggregateCall,
      provider,
      // This will call next() on all the update subjects
      subjects as Map<string, Subject<unknown>>
    );
    this.lastUpdateBlock.get(network)?.next(blockNumber);

    return { blockNumber, results };
  }

  // public static findRoute(
  //   base: string,
  //   quote: string,
  //   network: Network,
  //   onlyManipulationResistant = true
  // ) {

  // }

  // private static breadthFirstSearch(root: string) {
  //   const path = []
  //   const queue = [ root ]
  //   while (queue.length > 0) {
  //     const current = queue.shift()
  //     if (!current) continue
  //     path.push(current)
  //     for (const child of current.children) {
  //       queue.push(child)
  //     }
  //   }

  //   return path
  // }

  public static getLatestFromOracle(network: Network, oracleIndexKey: string) {
    const { subjects } = this.getOracleGraph(network);
    const s = subjects.get(oracleIndexKey);
    if (!s)
      throw Error(
        `Oracle Index Key: ${oracleIndexKey} not found on network ${network}`
      );
    return s.value;
  }

  public static subscribeLatestFromOracle(
    network: Network,
    oracleIndexKey: string
  ) {
    const { subjects } = this.getOracleGraph(network);
    const s = subjects.get(oracleIndexKey);
    if (!s)
      throw Error(
        `Oracle Index Key: ${oracleIndexKey} not found on network ${network}`
      );
    return s.asObservable();
  }

  public static getLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.value || 0;
  }

  public static subscribeLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.asObservable();
  }
}
