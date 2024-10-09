import {
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  RATE_PRECISION,
  unique,
  PERCENTAGE_BASIS,
  RATE_DECIMALS,
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  doSecantSearch,
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
      if (t.tokenType === 'PrimeDebt') {
        // Rewrite all prime debt to prime cash, this only applies to AccountRiskProfile, not
        // VaultAccountRiskProfile
        const pCash = getNetworkModel(t.network).getPrimeCash(t.currencyId);
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
  public settledBalances: TokenBalance[];

  protected get model() {
    return getNetworkModel(this.network);
  }

  protected _settle(
    b: TokenBalance,
    blockTime = getNowSeconds()
  ): TokenBalance {
    if (!b.token.maturity || b.token.maturity > blockTime) return b;

    this.settledBalances.push(b);

    if (b.tokenType === 'fCash') {
      return b.toPrimeCash();
    } else if (b.tokenType === 'VaultDebt') {
      const primeVaultDebt = this.model.getVaultDebt(
        b.vaultAddress,
        PRIME_CASH_VAULT_MATURITY
      );
      return TokenBalance.from(
        b.unwrapVaultToken().toPrimeDebt().n,
        primeVaultDebt
      );
    } else if (b.tokenType === 'VaultCash') {
      const primeVaultCash = this.model.getVaultCash(
        b.vaultAddress,
        PRIME_CASH_VAULT_MATURITY
      );
      // No conversion required for vault cash. It is always prime cash.
      return TokenBalance.from(b.unwrapVaultToken().n, primeVaultCash);
    } else if (b.tokenType === 'VaultShare') {
      const adapter = this.model.getVaultAdapter(b.vaultAddress);
      return adapter.convertToPrimeVaultShares(b);
    }

    throw Error('Invalid settle balance');
  }

  /** Takes a set of token balances to create a new risk profile */
  constructor(
    balances: TokenBalance[],
    public defaultSymbol: SymbolOrID,
    _network?: Network
  ) {
    this.settledBalances = [];
    this.balances = BaseRiskProfile.merge(balances.map((b) => this._settle(b)));

    if (this.balances.length === 0) {
      // Allow this to pass but none of the methods will really return any values
      if (!_network) throw Error('network must be defined');
      this.network = _network;
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
    return unique(
      this.allCurrencyIds.map((id) => {
        return this.model.getUnderlying(id).symbol;
      })
    ) as string[];
  }

  toString() {
    this.balances.map((b) => b.toDisplayStringWithSymbol(8)).join('\n');
  }

  /** Returns a token definition of the given symbol or currency id */
  denom(d: SymbolOrID) {
    if (typeof d === 'string') {
      try {
        // If the symbol does not work, try to look up by ID
        return this.model.getTokenBySymbol(d);
      } catch {
        return this.model.getTokenByID(d);
      }
    } else {
      // If the input is a currency id, then use the underlying
      return this.model.getUnderlying(d);
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
    return (n.ratioWith(d).toNumber() * PERCENTAGE_BASIS) / RATE_PRECISION;
  }

  protected _fromPercent(n: number) {
    return Math.floor((n * RATE_PRECISION) / PERCENTAGE_BASIS);
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

  /** Total value of assets in the specified currency */
  totalCurrencyAssets(currencyId: number, denominated = this.defaultSymbol) {
    return this._totalValue(
      this.collateral.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
    );
  }

  netWorth() {
    return this.totalAssets().add(this.totalDebt());
  }

  loanToValue() {
    const assets = this.totalAssets();
    if (assets.isZero()) return 0;

    return this._toPercent(this.totalDebt().neg(), assets);
  }

  liquidationPrice(debt: TokenDefinition, collateral: TokenDefinition) {
    return this.assetLiquidationThreshold(collateral)?.toToken(debt) || null;
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
        return this.leverageRatio(
          ...((args || []) as Parameters<RiskFactors['leverageRatio']>)
        ) as R;
      case 'liquidationPrice':
        return this.liquidationPrice(
          ...(args as Parameters<RiskFactors['liquidationPrice']>)
        ) as R;
      case 'assetLiquidationThreshold':
        return this.assetLiquidationThreshold(
          ...(args as Parameters<RiskFactors['assetLiquidationThreshold']>)
        ) as R;
      default:
        throw Error(`Unknown risk factor ${riskFactor}`);
    }
  }

  public getRiskFactorInRP<
    T extends keyof RiskFactors,
    R = ReturnType<RiskFactors[T]>
  >(riskFactor: T, limit: R): number {
    switch (riskFactor) {
      case 'netWorth':
      case 'freeCollateral':
        return (limit as TokenBalance).scaleTo(RATE_DECIMALS).toNumber();
      case 'loanToValue':
      case 'collateralRatio':
        return this._fromPercent(limit as number);
      case 'healthFactor':
      case 'leverageRatio':
        return Math.floor((limit as number) * RATE_PRECISION);
      case 'liquidationPrice':
      case 'assetLiquidationThreshold':
        return limit === null
          ? 0
          : (limit as TokenBalance).scaleTo(RATE_DECIMALS).toNumber();
      default:
        throw Error(`Unknown risk factor ${riskFactor}`);
    }
  }

  protected _getInitialEstimate<F extends keyof RiskFactors>(
    { riskFactor, args, limit }: RiskFactorLimit<F>,
    localUnderlyingId: string,
    estimateScalarInRP: number
  ): number {
    const value = this.getRiskFactor(riskFactor, args);
    const riskFactorInRP = this.getRiskFactorInRP(riskFactor, limit);
    const netLocal = this.netCollateralAvailable(localUnderlyingId);
    const totalAssets =
      args && riskFactor === 'leverageRatio' && typeof args[0] === 'number'
        ? this.totalCurrencyAssets(args[0])
        : this.totalAssets(localUnderlyingId);
    const totalDebt =
      args && riskFactor === 'leverageRatio' && typeof args[0] === 'number'
        ? this.totalCurrencyDebts(args[0])
        : this.totalDebt(localUnderlyingId);

    // NOTE: multiples should move the risk factor closer towards limit == value, so
    // if the limit is satisfied the next iteration of the loop will move closer towards
    // the limit. If the limit is satisfied by lte then the limit should be the denominator
    // in the multiple. Otherwise, it is the numerator.
    if (riskFactor == 'netWorth' || riskFactor == 'freeCollateral') {
      const _value = value as TokenBalance;
      const _limit = limit as TokenBalance;
      // A good estimate for this is limit - value
      return _limit.sub(_value).scaleTo(RATE_DECIMALS).toNumber();
    } else if (riskFactor === 'loanToValue') {
      let initialEstimateInRP: number;

      // limit = debt / asset
      // if deposit:
      //  limit = debt / (asset + deposit)
      //  deposit = (debt - asset * limit) / limit
      // if withdraw:
      //  limit = (debt - repay) / asset
      //  repay = debt - limit * asset
      if ((value as number) <= 0.001) {
        initialEstimateInRP =
          (riskFactorInRP * estimateScalarInRP) / RATE_PRECISION;
      } else if (netLocal.isPositive()) {
        initialEstimateInRP = totalDebt
          .neg()
          .sub(totalAssets.mulInRatePrecision(riskFactorInRP))
          .divInRatePrecision(riskFactorInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      } else {
        initialEstimateInRP = totalDebt
          .neg()
          .sub(totalAssets.mulInRatePrecision(riskFactorInRP))
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      }

      return initialEstimateInRP;
    } else if (riskFactor === 'collateralRatio') {
      // limit = asset / debt
      // if netLocal > 0:
      //  limit = (asset + deposit) / debt
      //  deposit = limit * debt - asset
      // if withdraw:
      //  limit = asset / (debt - repay)
      //  repay = (limit * debt - asset) / limit
      let initialEstimateInRP: number;

      if (value === null) {
        initialEstimateInRP =
          (riskFactorInRP * estimateScalarInRP) / RATE_PRECISION;
      } else if (netLocal.isPositive()) {
        initialEstimateInRP = totalDebt
          .neg()
          .mulInRatePrecision(riskFactorInRP)
          .sub(totalAssets)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      } else {
        initialEstimateInRP = totalDebt
          .neg()
          .mulInRatePrecision(riskFactorInRP)
          .sub(totalAssets)
          .divInRatePrecision(riskFactorInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      }

      return initialEstimateInRP;
    } else if (riskFactor === 'healthFactor') {
      throw Error('Unimplemented');
    } else if (riskFactor === 'leverageRatio') {
      // limit = debt / (asset - debt)
      // if netLocal > 0:
      //  limit = debt / (asset + deposit - debt)
      //  deposit = [debt * (1 + limit) - asset * limit] / limit
      // if netLocal < 0:
      //  limit = (debt - repay) / (asset - debt - repay)
      //  repay = [debt * (1 + limit) - limit * asset] / (1 - limit)
      let initialEstimateInRP: number;

      if (value === null || (value as number) < 1) {
        // If there is no leverage or a very small amount, then use the limit
        // as the number of debt units times the total assets.
        initialEstimateInRP = totalAssets.isZero()
          ? (riskFactorInRP * estimateScalarInRP) / RATE_PRECISION
          : totalAssets
              .mulInRatePrecision(riskFactorInRP)
              .scaleTo(RATE_DECIMALS)
              .toNumber();
      } else if (netLocal.isPositive()) {
        initialEstimateInRP = totalDebt
          .neg()
          .mulInRatePrecision(RATE_PRECISION + riskFactorInRP)
          .sub(totalAssets.mulInRatePrecision(riskFactorInRP))
          .divInRatePrecision(riskFactorInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      } else {
        initialEstimateInRP = totalDebt
          .neg()
          .mulInRatePrecision(RATE_PRECISION + riskFactorInRP)
          .sub(totalAssets.mulInRatePrecision(riskFactorInRP))
          .divInRatePrecision(RATE_PRECISION - riskFactorInRP)
          .scaleTo(RATE_DECIMALS)
          .toNumber();
      }

      return initialEstimateInRP;
    } else if (riskFactor === 'liquidationPrice') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      return _value === null
        ? RATE_PRECISION
        : _limit.ratioWith(_value).toNumber();
    } else if (riskFactor === 'assetLiquidationThreshold') {
      const _value = value as TokenBalance | null;
      const _limit = limit as TokenBalance;

      return _value ? _value.sub(_limit).scaleTo(RATE_DECIMALS).toNumber() : 0;
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
    const initialEstimateInRP = this._getInitialEstimate(
      riskFactorLimit,
      localUnderlyingId,
      RATE_PRECISION // This is not necessary in deposit / withdraw searches...
    );
    const targetLimitInRP = this.getRiskFactorInRP(
      riskFactorLimit.riskFactor,
      riskFactorLimit.limit
    );

    const calculationFunction = (collateralUnits: number) => {
      const value =
        TokenBalance.unit(local).mulInRatePrecision(collateralUnits);

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([value]);
      const limit = profile.getRiskFactor(
        riskFactorLimit.riskFactor,
        riskFactorLimit.args
      );
      const limitInRP = this.getRiskFactorInRP(
        riskFactorLimit.riskFactor,
        limit
      );

      return {
        fx: targetLimitInRP - limitInRP,
        value,
      };
    };

    return doSecantSearch(
      initialEstimateInRP,
      initialEstimateInRP * 2,
      calculationFunction
    );
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
    riskFactorLimit: RiskFactorLimit<F>,
    convertToCollateral: (debtBalance: TokenBalance) => {
      collateralBalance: TokenBalance;
      debtFee: TokenBalance;
      collateralFee: TokenBalance;
      netRealizedCollateralBalance: TokenBalance;
      netRealizedDebtBalance: TokenBalance;
    },
    initialDebtUnitsEstimateInRP: number,
    initialGuessMultiple = 2
  ) {
    // Uses the debt as the local currency
    const localUnderlyingId =
      debt.tokenType === 'Underlying' ? debt.id : debt.underlying;
    if (localUnderlyingId === undefined)
      throw Error('undefined local underlying');

    const targetLimitInRP = this.getRiskFactorInRP(
      riskFactorLimit.riskFactor,
      riskFactorLimit.limit
    );

    const calculationFunction = (debtUnits: number) => {
      // NOTE: this multiple is in "denom" terms. Need to convert it to local underlying
      // terms before we multiply it to get the debt figure. Use the currency id so that vault
      // debts convert properly.
      const defaultToken = this.denom(localUnderlyingId);
      const debtBalance =
        debt.currencyId === defaultToken.currencyId
          ? TokenBalance.unit(debt)
              .mulInRatePrecision(Math.floor(debtUnits))
              .neg()
          : TokenBalance.unit(defaultToken)
              .mulInRatePrecision(Math.floor(debtUnits))
              .toToken(debt)
              .neg();

      const collateralOutputs = convertToCollateral(debtBalance);

      // Create a new account profile with the simulated collateral added
      const profile = this.simulate([
        debtBalance,
        collateralOutputs.collateralBalance,
      ]);
      const limit = profile.getRiskFactor(
        riskFactorLimit.riskFactor,
        riskFactorLimit.args
      );
      const limitInRP = this.getRiskFactorInRP(
        riskFactorLimit.riskFactor,
        limit
      );

      return {
        fx: targetLimitInRP - limitInRP,
        value: { debtBalance, ...collateralOutputs },
      };
    };

    // set the required precision based on the riskLimitType
    return doSecantSearch(
      initialDebtUnitsEstimateInRP,
      initialDebtUnitsEstimateInRP * initialGuessMultiple,
      calculationFunction
    );
  }

  getAllLiquidationPrices() {
    const assets = this.balances
      .map((a) => a.token)
      .concat(unique(this.balances.map((a) => a.underlying)))
      // Prefer to show underlying over prime cash
      .filter((c) => c.tokenType !== 'PrimeCash');

    return assets
      .map((a) => {
        const isDebtThreshold = this.netCollateralAvailable(
          a.symbol
        ).isNegative();

        return {
          asset: a,
          threshold: this.assetLiquidationThreshold(a),
          isDebtThreshold,
        };
      })
      .filter(({ threshold }) => threshold !== null);
  }

  getRiskExposureType(
    collateral: TokenDefinition,
    debt: TokenDefinition,
    collateralThreshold: TokenBalance | null
  ) {
    if (
      collateral.tokenType === 'fCash' &&
      (collateral.maturity || 0) < getNowSeconds() &&
      debt.tokenType === 'PrimeDebt'
    ) {
      // Matured fCash with prime debt in the same currency must be settled
      return { isCrossCurrency: false, isPrimeDebt: true, risk: 'Settlement' };
    } else if (
      collateral.tokenType === 'PrimeCash' &&
      debt.tokenType === 'fCash' &&
      (debt.maturity || 0) < getNowSeconds()
    ) {
      // Matured fCash with prime debt in the same currency must be settled
      return { isCrossCurrency: false, isPrimeDebt: false, risk: 'Settlement' };
    } else if (
      collateral.currencyId === debt.currencyId &&
      collateralThreshold
    ) {
      // All local currency risks
      return {
        isCrossCurrency: false,
        isPrimeDebt: false,
        risk: collateral.tokenType,
      };
    } else if (collateralThreshold) {
      return {
        isCrossCurrency: true,
        isPrimeDebt:
          debt.tokenType === 'PrimeDebt' ||
          (debt.tokenType === 'VaultDebt' &&
            debt.maturity === PRIME_CASH_VAULT_MATURITY &&
            !!collateralThreshold),
        risk: collateral.tokenType,
      };
    }

    return undefined;
  }

  /** Abstract Risk Factor Implementations **/
  abstract freeCollateral(): TokenBalance;
  abstract collateralRatio(): number | null;
  abstract leverageRatio(currencyId?: number): number | null;
  abstract healthFactor(): number | null;
  abstract assetLiquidationThreshold(
    asset: TokenDefinition
  ): TokenBalance | null;
  abstract simulate(apply: TokenBalance[]): BaseRiskProfile;
  abstract totalAssetsRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  abstract totalDebtRiskAdjusted(denominated: SymbolOrID): TokenBalance;
  abstract netCollateralAvailable(denominated: SymbolOrID): TokenBalance;
  //   getLiquidationPenalty() {}
}
