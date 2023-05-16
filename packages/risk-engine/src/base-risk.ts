import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  RATE_PRECISION,
  unique,
  doBinarySearch,
} from '@notional-finance/util';
import { RiskFactorLimit, RiskFactors, SymbolOrID } from './types';

export abstract class BaseRiskProfile implements RiskFactors {
  static merge(a: TokenBalance[], b?: TokenBalance[]) {
    return Array.from(this._merge(b || [], this._merge(a)).values());
  }

  protected static _merge = (
    tokens: TokenBalance[],
    map: Map<string, TokenBalance> = new Map<string, TokenBalance>()
  ) => {
    return tokens.reduce((m, t) => {
      const match = m.get(t.typeKey);
      if (match) {
        m.set(match.typeKey, match.add(t));
      } else {
        m.set(t.typeKey, t);
      }
      return m;
    }, map);
  };

  protected static _sum = (s: TokenBalance, t: TokenBalance) => s.add(t);

  public network: Network;
  public balances: TokenBalance[];

  /** Takes a set of token balances to create a new risk profile */
  constructor(balances: TokenBalance[], public defaultSymbol: SymbolOrID) {
    if (balances.length === 0) {
      // Allow this to pass but none of the methods will really return any values
      this.network = Network.All;
    } else {
      const network = unique(balances.map((b) => b.network));
      if (network.length > 1)
        throw Error('All balances must be on same network');
      this.network = network[0];
    }

    this.balances = BaseRiskProfile.merge(balances);
  }

  /** All currency ids represented in the account */
  get allCurrencyIds() {
    return unique(
      this.balances
        .map((b) => b.token.currencyId)
        .filter((b) => b !== undefined)
    ) as number[];
  }

  /** All symbols represented in the account */
  get allSymbols() {
    const tokens = Registry.getTokenRegistry();
    return unique(
      this.allCurrencyIds.map((id) => {
        return tokens.getUnderlying(this.network, id).symbol;
      })
    ) as string[];
  }

  /** Returns a token definition of the given symbol or currency id */
  denom(d: SymbolOrID) {
    const tokens = Registry.getTokenRegistry();
    if (typeof d === 'string') {
      try {
        // If the symbol does not work, try to look up by ID
        return tokens.getTokenBySymbol(this.network, d);
      } catch {
        return tokens.getTokenByID(this.network, d);
      }
    } else {
      // If the input is a currency id, then use the underlying
      return tokens.getUnderlying(this.network, d);
    }
  }

  isAsset(t: TokenBalance) {
    return t.isPositive();
  }

  isDebt(t: TokenBalance) {
    return t.isNegative();
  }

  protected _totalValue(b: TokenBalance[], d: TokenDefinition) {
    return b
      .map((t) => t.toToken(d))
      .reduce(BaseRiskProfile._sum, TokenBalance.zero(d));
  }

  get assets() {
    return this.balances.filter((t) => this.isAsset(t));
  }

  get debts() {
    return this.balances.filter((t) => this.isDebt(t));
  }

  /****** Summary Factors ******/

  /** Total value without risk adjustments */
  totalAssets(denominated = this.defaultSymbol) {
    return this._totalValue(this.assets, this.denom(denominated));
  }

  /** Total debt without risk adjustments */
  totalDebt(denominated = this.defaultSymbol) {
    return this._totalValue(this.debts, this.denom(denominated));
  }

  /** Total value of debts in the specified currency */
  totalCurrencyDebts(currencyId: number, denominated = this.defaultSymbol) {
    return this._totalValue(
      this.debts.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
    );
  }

  netWorth() {
    return this.totalAssets().sub(this.totalDebt());
  }

  loanToValue() {
    const assets = this.totalAssets();
    if (assets.isZero()) return 0;

    return this.totalDebt().ratioWith(assets).abs().toNumber() / RATE_PRECISION;
  }

  leverageRatio() {
    const collateralRatio = this.collateralRatio();
    if (collateralRatio) {
      return (RATE_PRECISION * RATE_PRECISION) / collateralRatio;
    } else {
      return null;
    }
  }

  liquidationPrice(debt: TokenDefinition, collateral: TokenDefinition) {
    return (
      this.collateralLiquidationThreshold(collateral)?.toToken(debt) || null
    );
  }

  getRiskFactor<
    T extends keyof RiskFactors,
    P = Parameters<RiskFactors[T]>,
    R = ReturnType<RiskFactors[T]>
  >(riskFactor: T, args: P): R {
    switch (riskFactor) {
      case 'netWorth':
        return this.netWorth() as R;
      case 'freeCollateral':
        return this.freeCollateral() as R;
      case 'loanToValue':
        return this.loanToValue() as R;
      case 'collateralRatio':
        return this.collateralRatio() as R;
      case 'healthFactor':
        return this.healthFactor() as R;
      case 'leverageRatio':
        return this.leverageRatio() as R;
      case 'liquidationPrice':
        return this.liquidationPrice(
          ...(args as Parameters<RiskFactors['liquidationPrice']>)
        ) as R;
      case 'collateralLiquidationThreshold':
        return this.collateralLiquidationThreshold(
          ...(args as Parameters<RiskFactors['collateralLiquidationThreshold']>)
        ) as R;
      default:
        throw Error(`Unknown risk factor ${riskFactor}`);
    }
  }

  checkRiskFactorLimit<F extends keyof RiskFactors>({
    riskFactor,
    args,
    limit,
  }: RiskFactorLimit<F>): {
    value: ReturnType<RiskFactors[F]>;
    satisfied: boolean;
    multiple: number;
  } {
    const value = this.getRiskFactor(riskFactor, args);
    // NOTE: multiples should move the risk factor closer towards limit == value, so
    // if the limit is satisfied the next iteration of the loop will move closer towards
    // the limit. If the limit is satisfied by lte then the limit should be the denominator
    // in the multiple. Otherwise, it is the numerator.
    if (riskFactor == 'netWorth' || riskFactor == 'freeCollateral') {
      const _value = value as TokenBalance;
      const _limit = limit as TokenBalance;
      return {
        value,
        satisfied: _limit.lte(_value),
        multiple: _limit.ratioWith(_value).toNumber(),
      };
    } else if (riskFactor === 'loanToValue') {
      const _value = value as number;
      const _limit = limit as number;

      return {
        value,
        satisfied: _value <= _limit,
        multiple: Math.floor((_value * RATE_PRECISION) / _limit),
      };
    } else if (
      riskFactor === 'collateralRatio' ||
      riskFactor === 'healthFactor'
    ) {
      const _value = value as number | null;
      const _limit = limit as number;

      return {
        value,
        satisfied: _value === null || _limit <= _value,
        multiple:
          _value === null
            ? RATE_PRECISION
            : Math.floor((_limit * RATE_PRECISION) / _value),
      };
    } else if (riskFactor === 'leverageRatio') {
      const _value = value as number | null;
      const _limit = limit as number;

      return {
        value,
        satisfied: _value === null || _value <= _limit,
        multiple:
          _value === null
            ? RATE_PRECISION
            : Math.floor((_value * RATE_PRECISION) / _limit),
      };
    } else if (riskFactor === 'liquidationPrice') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      return {
        value,
        satisfied: _value === null || _limit.lte(_value),
        multiple:
          _value === null
            ? RATE_PRECISION
            : _limit.ratioWith(_value).toNumber(),
      };
    } else if (riskFactor === 'collateralLiquidationThreshold') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      return {
        value,
        satisfied: _value === null || _value.lte(_limit),
        multiple:
          _value === null
            ? RATE_PRECISION
            : _value.ratioWith(_limit).toNumber(),
      };
    }

    throw Error(`Unknown risk factor ${riskFactor}`);
  }

  /***** SIMULATED REQUIREMENTS *******/

  private _search<F extends keyof RiskFactors>(
    collateral: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>,
    isWithdraw: boolean
  ) {
    const { multiple } = this.checkRiskFactorLimit(riskFactorLimit);

    const calculationFunction = (collateralUnits: number) => {
      let value =
        TokenBalance.unit(collateral).mulInRatePrecision(collateralUnits);
      if (isWithdraw) value = value.neg();

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([value]);
      const { satisfied, multiple } =
        profile.checkRiskFactorLimit(riskFactorLimit);

      return {
        actualMultiple: multiple,
        breakLoop: satisfied,
        value,
      };
    };

    return doBinarySearch(multiple, RATE_PRECISION, calculationFunction);
  }

  /**
   * Returns the minimum amount of collateral that needs to be deposited in order to
   * maintain the specified risk factor limit
   *
   * @param collateral
   * @param riskFactorLimits
   * @returns
   */
  getDepositRequiredToMaintainRiskFactor<F extends keyof RiskFactors>(
    collateral: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    return this._search(collateral, riskFactorLimit, false);
  }

  /**
   * Returns the amount of collateral that can be withdrawn or borrowed in order to maintain
   * the given level of the risk factor
   * @param collateral
   * @param riskFactorLimits
   */
  getWithdrawRequiredToMaintainRiskFactor<F extends keyof RiskFactors>(
    collateral: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    return this._search(collateral, riskFactorLimit, true);
  }

  /**
   * Returns the amount of collateral to sell that will repay the given amount of debt to repay in
   * order to maintain the given risk factor limit
   * @param debt
   * @param collateral
   * @param riskFactorLimit
   */
  getDeleverageMaintainRiskFactor<F extends keyof RiskFactors>(
    debt: TokenDefinition,
    collateral: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    const { multiple } = this.checkRiskFactorLimit(riskFactorLimit);

    const calculationFunction = (multiple: number) => {
      const debtRepaid = TokenBalance.unit(collateral)
        .mulInRatePrecision(multiple)
        .neg();
      const collateralSold =
        TokenBalance.unit(debt).mulInRatePrecision(multiple);

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([debtRepaid, collateralSold]);
      const { satisfied, multiple: actualMultiple } =
        profile.checkRiskFactorLimit(riskFactorLimit);

      return {
        actualMultiple,
        breakLoop: satisfied,
        value: { debtRepaid, collateralSold },
      };
    };

    return doBinarySearch(multiple, RATE_PRECISION, calculationFunction);
  }

  // allLiquidationPrices() {
  //   // get all collateral ids + underlying
  //   // get all debt ids + underlying
  // }

  /** Abstract Risk Factor Implementations **/
  abstract freeCollateral(): TokenBalance;
  abstract collateralRatio(): number | null;
  abstract healthFactor(): number | null;
  abstract collateralLiquidationThreshold(
    collateral: TokenDefinition
  ): TokenBalance | null;
  abstract simulate(apply: TokenBalance[]): BaseRiskProfile;
  abstract totalAssetsRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  abstract totalDebtRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  //   getLiquidationPenalty() {}
}
