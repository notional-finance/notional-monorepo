import {
  SCALAR_PRECISION,
  Network,
  SCALAR_DECIMALS,
  decodeERC1155Id,
  getNowSeconds,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, utils } from 'ethers';
import {
  combineLatest,
  map,
  Observable,
  of,
  Subscription,
  withLatestFrom,
} from 'rxjs';
import { ExchangeRate, OracleDefinition, Registry, RiskAdjustment } from '..';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { OracleType } from '../.graphclient';

interface Node {
  id: string;
  inverted: boolean;
}
type AdjList = Map<string, Map<string, Node>>;
const UNIT_RATE = 'UNIT_RATE';

export class OracleRegistryClient extends ClientRegistry<OracleDefinition> {
  protected cachePath = Routes.Oracles;

  protected adjLists = new Map<Network, AdjList>();
  private _adjListSubscription: Subscription;

  /** Rate equal to one unit in 18 decimal precision with an arbitrary future timestamp */
  private _getUnitRate(
    network: Network,
    baseId: string
  ): Observable<OracleDefinition> {
    const token = Registry.getTokenRegistry().getTokenByID(network, baseId);
    let oracleType: OracleType;
    if (
      token.tokenType === 'Underlying' ||
      token.tokenType == 'nToken' ||
      token.tokenType == 'fCash'
    )
      oracleType = 'Chainlink';
    else throw Error('Unknown unit rate type');

    return of({
      id: UNIT_RATE,
      base: baseId,
      quote: baseId,
      network,
      oracleType,
      decimals: 18,
      oracleAddress: ZERO_ADDRESS,
      latestRate: {
        rate: SCALAR_PRECISION,
        timestamp: 2 ** 32,
        blockNumber: 2 ** 32,
      },
      historicalRates: [],
    } as OracleDefinition);
  }

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

          // TODO: fcash rates there are three versions:
          // spot rate, oracle rate, settlement rate
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
    // Will return a unit oracle rate so that risk adjustments still work
    if (base === quote) return [base];

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
  protected getObservablesFromPath(
    network: Network,
    path: string[],
    riskAdjusted: RiskAdjustment
  ) {
    const subjects = this._getNetworkSubjects(network);
    const adjList = this.adjLists.get(network);
    if (!adjList) throw Error(`Adjacency list not found for ${network}`);
    const config = Registry.getConfigurationRegistry();

    return path.map((token, i) => {
      let observable: Observable<OracleDefinition | null>;
      let node: Node;
      if (i === 0) {
        observable = this._getUnitRate(network, token);
        node = { id: UNIT_RATE, inverted: false };
      } else {
        const n = adjList.get(token)?.get(path[i - 1]);
        if (!n) throw Error(`${token} node is not found`);
        node = n;

        const o = subjects.get(node.id)?.asObservable();
        if (!o) throw Error(`Update Subject for ${node.id} not found`);
        observable = o;
      }

      return observable.pipe(
        map((o: OracleDefinition | null) => {
          if (!o) return null;
          // TODO: need to handle settlement here....

          // fCash rates are interest rates so convert them to exchange rates in SCALAR_PRECISION here
          if (
            o.oracleType === 'fCashOracleRate' ||
            o.oracleType === 'fCashSpotRate'
          ) {
            // Adjustment is set to identity values if riskAdjusted is set to None.
            const { interestAdjustment, maxDiscountFactor, oracleRateLimit } =
              config.getInterestRiskAdjustment(o, node.inverted, riskAdjusted);

            // The fcash asset is always the quote asset in the oracle
            const { maturity } = decodeERC1155Id(o.quote);
            let rate = o.latestRate.rate.add(interestAdjustment);

            // Apply oracle min or max limits after adjustments
            if (oracleRateLimit && riskAdjusted === 'Asset') {
              rate = rate.gt(oracleRateLimit) ? oracleRateLimit : rate;
            } else if (oracleRateLimit && riskAdjusted === 'Debt') {
              rate = rate.lt(oracleRateLimit) ? oracleRateLimit : rate;
            }

            const exchangeRate = this.interestToExchangeRate(
              node.inverted ? rate : rate.mul(-1),
              maturity
            );

            if (exchangeRate.gt(maxDiscountFactor)) {
              return {
                ...o.latestRate,
                // Scale the discount factor up to 18 decimals
                rate: BigNumber.from(maxDiscountFactor).mul(RATE_PRECISION),
              };
            } else {
              return { ...o.latestRate, rate: exchangeRate };
            }
          } else {
            const haircutOrBuffer = config.getExchangeRiskAdjustment(
              o,
              node.inverted,
              riskAdjusted
            );

            const scaled = this.scaleTo(o, 18);
            const adjusted = {
              ...scaled,
              rate: scaled.rate.mul(100).div(haircutOrBuffer),
            };
            return node.inverted ? this.invertRate(adjusted) : adjusted;
          }
        })
      );
    });
  }

  getLatestFromPath(
    network: Network,
    path: string[],
    riskAdjusted: RiskAdjustment = 'None'
  ): ExchangeRate | null {
    const observables = this.getObservablesFromPath(
      network,
      path,
      riskAdjusted
    );
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

  subscribeToPath(
    network: Network,
    oraclePath: string[],
    riskAdjusted: RiskAdjustment = 'None'
  ) {
    const observables = this.getObservablesFromPath(
      network,
      oraclePath,
      riskAdjusted
    );
    return combineLatest(observables).pipe(
      map((rates) => this.combineRates(rates))
    );
  }

  combineRates(rates: (ExchangeRate | null)[]) {
    if (rates.length === 0) return null;

    const rate = rates.reduce(
      (p, er) => (er && p ? p.mul(er.rate).div(SCALAR_PRECISION) : null),
      BigNumber.from(SCALAR_PRECISION) as BigNumber | null
    );

    const timestamp = Math.min(...rates.map((r) => r?.timestamp || 0));
    const blockNumber = Math.min(...rates.map((r) => r?.blockNumber || 0));

    return rate ? { rate, timestamp, blockNumber } : null;
  }

  scaleTo(o: OracleDefinition, decimals = 18) {
    if (o.decimals < decimals) {
      // Scale to 18 decimals:
      // mul 10 ^ (18 - r.decimals)
      return {
        ...o.latestRate,
        rate: o.latestRate.rate.mul(
          BigNumber.from(10).pow(decimals - o.decimals)
        ),
      };
    } else if (o.decimals > decimals) {
      // Scale to 18 decimals:
      return {
        ...o.latestRate,
        rate: o.latestRate.rate.div(
          BigNumber.from(10).pow(o.decimals - decimals)
        ),
      };
    } else {
      return o.latestRate;
    }
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

    const timeToMaturity = maturity - currentTime;
    // interest rate = ln(exchangeRate) * SECONDS_IN_YEAR / timeToMaturity
    const annualRate =
      ((Math.log(exchangeRate.toNumber() / RATE_PRECISION) * SECONDS_IN_YEAR) /
        timeToMaturity) *
      RATE_PRECISION;
    return Math.trunc(annualRate);
  }
}
