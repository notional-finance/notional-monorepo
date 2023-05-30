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
  PERCENTAGE_BASIS,
  RATE_DECIMALS,
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
      if (t.token.tokenType === 'PrimeDebt') {
        // Rewrite all prime debt to prime cash, this only applies to AccountRiskProfile, not
        // VaultAccountRiskProfile
        const pCash = Registry.getTokenRegistry().getPrimeCash(
          t.network,
          t.currencyId
        );
        t = t.toToken(pCash);
      }

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
    this.balances = BaseRiskProfile.merge(balances);

    if (this.balances.length === 0) {
      // Allow this to pass but none of the methods will really return any values
      this.network = Network.All;
    } else {
      const network = unique(this.balances.map((b) => b.network));
      if (network.length > 1)
        throw Error('All balances must be on same network');
      this.network = network[0];
    }
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

  toString() {
    this.balances.map((b) => b.toDisplayStringWithSymbol(8)).join('\n');
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

  get collateral() {
    return this.balances.filter((t) => this.isAsset(t));
  }

  get debts() {
    return this.balances.filter((t) => this.isDebt(t));
  }

  /****** Summary Factors ******/

  protected _toPercent(n: TokenBalance, d: TokenBalance) {
    return (
      (n.ratioWith(d).abs().toNumber() * PERCENTAGE_BASIS) / RATE_PRECISION
    );
  }

  /** Total value without risk adjustments */
  totalAssets(denominated = this.defaultSymbol) {
    return this._totalValue(this.collateral, this.denom(denominated));
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
    return this.totalAssets().add(this.totalDebt());
  }

  loanToValue() {
    const assets = this.totalAssets();
    if (assets.isZero()) return 0;

    return this._toPercent(this.totalDebt(), assets);
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

  checkRiskFactorLimit<F extends keyof RiskFactors>(
    { riskFactor, args, limit }: RiskFactorLimit<F>,
    localUnderlyingId: string
  ): {
    value: ReturnType<RiskFactors[F]>;
    multiple: number;
  } {
    const value = this.getRiskFactor(riskFactor, args);
    const netLocal = this.netCollateralAvailable(localUnderlyingId);
    // NOTE: multiples should move the risk factor closer towards limit == value, so
    // if the limit is satisfied the next iteration of the loop will move closer towards
    // the limit. If the limit is satisfied by lte then the limit should be the denominator
    // in the multiple. Otherwise, it is the numerator.
    if (riskFactor == 'netWorth' || riskFactor == 'freeCollateral') {
      const _value = value as TokenBalance;
      const _limit = limit as TokenBalance;
      // A good estimate for this is limit - value
      return {
        value,
        multiple: _limit.sub(_value).scaleTo(RATE_DECIMALS).toNumber(),
      };
    } else if (riskFactor === 'loanToValue') {
      let multiple: number;
      const limitInRP = ((limit as number) * RATE_PRECISION) / 100;

      // limit = debt / asset
      // if deposit:
      //  limit = debt / (asset + deposit)
      //  deposit = (debt - asset * limit) / limit
      // if withdraw:
      //  limit = (debt - repay) / asset
      //  repay = debt - limit * asset
      if (netLocal.isPositive()) {
        multiple = this.totalDebt()
          .neg()
          .sub(this.totalAssets().mulInRatePrecision(limitInRP))
          .divInRatePrecision(limitInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      } else {
        multiple = this.totalDebt()
          .neg()
          .sub(this.totalAssets().mulInRatePrecision(limitInRP))
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      }

      return {
        value,
        multiple,
      };
    } else if (riskFactor === 'collateralRatio') {
      // limit = asset / debt
      // if deposit:
      //  limit = (asset + deposit) / debt
      //  deposit = limit * debt - asset
      // if withdraw:
      //  limit = asset / (debt - repay)
      //  repay = (limit * debt - asset) / limit

      let multiple: number;
      const limitInRP = ((limit as number) * RATE_PRECISION) / 100;

      if (netLocal.isPositive()) {
        multiple = this.totalDebt()
          .neg()
          .mulInRatePrecision(limitInRP)
          .sub(this.totalAssets())
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      } else {
        multiple = this.totalDebt()
          .neg()
          .mulInRatePrecision(limitInRP)
          .sub(this.totalAssets())
          .divInRatePrecision(limitInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      }

      return {
        value,
        multiple,
      };
    } else if (riskFactor === 'healthFactor') {
      throw Error('Unimplemented');
    } else if (riskFactor === 'leverageRatio') {
      throw Error('Unimplemented');
    } else if (riskFactor === 'liquidationPrice') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      return {
        value,
        multiple:
          _value === null
            ? RATE_PRECISION
            : _limit.ratioWith(_value).toNumber(),
      };
    } else if (riskFactor === 'collateralLiquidationThreshold') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      const multiple = _value
        ? _value.sub(_limit).scaleTo(RATE_DECIMALS).toNumber()
        : 0;
      return {
        value,
        multiple,
      };
    }

    throw Error(`Unknown risk factor ${riskFactor}`);
  }

  /***** SIMULATED REQUIREMENTS *******/

  private _search<F extends keyof RiskFactors>(
    riskFactorLimit: RiskFactorLimit<F>,
    local: TokenDefinition
  ) {
    const localUnderlyingId =
      local.tokenType === 'Underlying' ? local.id : local.underlying;
    if (localUnderlyingId === undefined)
      throw Error('undefined local underlying');
    const { multiple } = this.checkRiskFactorLimit(
      riskFactorLimit,
      localUnderlyingId
    );

    const calculationFunction = (collateralUnits: number) => {
      const value =
        TokenBalance.unit(local).mulInRatePrecision(collateralUnits);

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([value]);
      const { multiple } = profile.checkRiskFactorLimit(
        riskFactorLimit,
        localUnderlyingId
      );

      return {
        // Negation is required here due to how the loop adjustment works
        actualMultiple: -multiple,
        breakLoop: false,
        value,
      };
    };

    return doBinarySearch(multiple, 0, calculationFunction);
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
    local: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    return this._search(riskFactorLimit, local);
  }

  /**
   * Returns the amount of collateral that can be withdrawn or borrowed in order to maintain
   * the given level of the risk factor
   * @param collateral
   * @param riskFactorLimits
   */
  getWithdrawRequiredToMaintainRiskFactor<F extends keyof RiskFactors>(
    local: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    return this._search(riskFactorLimit, local);
  }

  /**
   * Returns the amount of collateral to sell that will repay the given amount of debt to repay in
   * order to maintain the given risk factor limit
   * @param debt
   * @param collateral
   * @param riskFactorLimit
   */
  getDebtAndCollateralMaintainRiskFactor<F extends keyof RiskFactors>(
    debt: TokenDefinition,
    collateral: TokenDefinition,
    riskFactorLimit: RiskFactorLimit<F>
  ) {
    // Uses the debt as the local currency
    const localUnderlyingId =
      debt.tokenType === 'Underlying' ? debt.id : debt.underlying;
    if (localUnderlyingId === undefined)
      throw Error('undefined local underlying');
    const { multiple } = this.checkRiskFactorLimit(
      riskFactorLimit,
      localUnderlyingId
    );

    const calculationFunction = (multiple: number) => {
      let netDebt: TokenBalance;
      if (
        riskFactorLimit.riskFactor === 'freeCollateral' ||
        riskFactorLimit.riskFactor === 'netWorth'
      ) {
        netDebt = TokenBalance.fromFloat(
          multiple / RATE_PRECISION,
          this.denom(this.defaultSymbol)
        )
          .toToken(debt)
          .neg();
      } else {
        netDebt = TokenBalance.unit(debt).mulInRatePrecision(multiple).neg();
      }
      // If netDebt is decreasing, netCollateral will also decrease because it will be sold
      // to repay debt. If netDebt is increasing, netCollateral will also increase because borrowed
      // cash will be used to buy collateral.
      const netCollateral = netDebt.toToken(collateral);

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([netDebt, netCollateral]);
      const { multiple: actualMultiple } = profile.checkRiskFactorLimit(
        riskFactorLimit,
        localUnderlyingId
      );

      return {
        actualMultiple,
        breakLoop: false,
        value: { netDebt, netCollateral },
      };
    };

    return doBinarySearch(multiple, 0, calculationFunction);
  }

  getAllLiquidationPrices() {
    // get all collateral ids + underlying
    const collateral = this.collateral
      .map((a) => a.token)
      .concat(unique(this.collateral.map((a) => a.underlying)))
      // Prefer to show underlying over prime cash
      .filter((c) => c.tokenType !== 'PrimeCash');

    // get all debt ids + underlying
    const debt = this.debts
      .map((a) => a.token)
      .concat(unique(this.debts.map((a) => a.underlying)))
      // Prefer to show underlying over prime cash
      .filter((c) => c.tokenType !== 'PrimeCash');

    return collateral
      .flatMap((c) => {
        const collateralThreshold = this.collateralLiquidationThreshold(c);
        return debt
          .filter((d) => d.id !== c.id)
          .map((d) => {
            return {
              collateral: c,
              debt: d,
              liquidationPrice: collateralThreshold?.toToken(d) || null,
            };
          });
      })
      .filter(({ liquidationPrice }) => liquidationPrice !== null);
  }

  /** Abstract Risk Factor Implementations **/
  abstract freeCollateral(): TokenBalance;
  abstract collateralRatio(): number | null;
  abstract leverageRatio(): number | null;
  abstract healthFactor(): number | null;
  abstract collateralLiquidationThreshold(
    collateral: TokenDefinition
  ): TokenBalance | null;
  abstract simulate(apply: TokenBalance[]): BaseRiskProfile;
  abstract totalAssetsRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  abstract totalDebtRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  abstract netCollateralAvailable(denominated: SymbolOrID): TokenBalance;
  //   getLiquidationPenalty() {}
}
