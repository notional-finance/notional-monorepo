import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import {
  FLOATING_POINT_DUST,
  INTERNAL_PRECISION_DUST,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  PERCENTAGE_BASIS,
  RATE_PRECISION,
} from '@notional-finance/util';
import { BaseRiskProfile } from './base-risk';
import { SymbolOrID } from './types';

export class AccountRiskProfile extends BaseRiskProfile {
  static simulate(from: TokenBalance[], apply: TokenBalance[]) {
    return new AccountRiskProfile([...from, ...apply]);
  }

  simulate(apply: TokenBalance[]) {
    return AccountRiskProfile.simulate(this.balances, apply);
  }

  /** Takes a set of token balances to create a new account risk profile */
  constructor(_balances: TokenBalance[], _network?: Network) {
    const balances = _balances.filter(
      (t) =>
        !t.isVaultToken &&
        t.tokenType !== 'Underlying' &&
        t.tokenType !== 'Fiat' &&
        t.tokenType !== 'NOTE'
    );

    super(balances, 'ETH', _network);
  }

  protected _totalRiskAdjusted(b: TokenBalance[], d: TokenDefinition) {
    return this._totalValue(
      b.map((t) => t.toToken(d, t.isNegative() ? 'Debt' : 'Asset')),
      d
    );
  }

  /***** RISK RATIOS *******/
  collateralRatio() {
    const debts = this.totalDebt();
    if (debts.isZero()) return null;

    try {
      return this._toPercent(this.totalAssets(), debts.neg());
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((e as any)['code'] === 'NUMERIC_FAULT') return null;
      throw e;
    }
  }

  maxLoanToValue() {
    const ltv = this.loanToValue();
    const assets = this.totalAssetsRiskAdjusted();
    if (assets.isZero()) return 0;

    const riskAdjustedLTV = this._toPercent(
      this.totalDebtRiskAdjusted(),
      assets
    );

    return ltv / riskAdjustedLTV;
  }

  /** Total value of all assets with a risk adjustment */
  totalAssetsRiskAdjusted(denominated = this.defaultSymbol) {
    return this._totalRiskAdjusted(this.collateral, this.denom(denominated));
  }

  /** Total debt with risk adjustments */
  totalDebtRiskAdjusted(denominated = this.defaultSymbol) {
    return this._totalRiskAdjusted(this.debts, this.denom(denominated));
  }

  /** Total value of assets in the specified currency with risk adjustments */
  totalCurrencyAssetsRiskAdjusted(currencyId: number) {
    return this._totalRiskAdjusted(
      this.collateral.filter((t) => t.token.currencyId === currencyId),
      this.model.getPrimeCash(currencyId)
    );
  }

  /** Total value of debts in the specified currency with risk adjustments */
  totalCurrencyDebtsRiskAdjusted(currencyId: number) {
    return this._totalRiskAdjusted(
      this.debts.filter((t) => t.token.currencyId === currencyId),
      this.model.getPrimeCash(currencyId)
    );
  }

  /**
   * Net value of debts and assets in the specified token with risk adjustments, denominated
   * in the given token.
   */
  netCollateralAvailable(_collateral: SymbolOrID) {
    const collateral = this.denom(_collateral);

    return this._totalRiskAdjusted(
      this.balances.filter((t) =>
        // If underlying is specified the sum up all assets in that underlying
        collateral.tokenType === 'Underlying'
          ? t.token.underlying === collateral.id
          : t.token.id === collateral.id
      ),
      collateral
    );
  }

  freeCollateralFactors() {
    const denom = this.denom(this.defaultSymbol);

    return this.allCurrencyIds.map((currencyId) => {
      const totalAssetsLocal = this.totalCurrencyAssetsRiskAdjusted(currencyId);
      const totalDebtsLocal = this.totalCurrencyDebtsRiskAdjusted(currencyId);
      const netLocal = totalAssetsLocal.add(totalDebtsLocal);
      let netFC: TokenBalance;
      let totalAssetsDenom: TokenBalance;
      let totalDebtsDenom: TokenBalance;

      const { haircut, buffer } = this.model.getCurrencyHaircutAndBuffer(denom);

      if (netLocal.currencyId === denom.currencyId) {
        // Handle special case when netLocal is in the denom currency
        const adjustment = netLocal.isPositive() ? haircut : buffer;
        netFC = netLocal.toUnderlying().scale(adjustment, PERCENTAGE_BASIS);
        totalAssetsDenom = totalAssetsLocal
          .toUnderlying()
          .scale(adjustment, PERCENTAGE_BASIS);
        totalDebtsDenom = totalDebtsLocal
          .toUnderlying()
          .scale(adjustment, PERCENTAGE_BASIS);
      } else {
        const adjustment = netLocal.isNegative() ? 'Debt' : 'Asset';
        netFC = netLocal.toToken(denom, adjustment);
        totalAssetsDenom = totalAssetsLocal.toToken(denom, adjustment);
        totalDebtsDenom = totalDebtsLocal.toToken(denom, adjustment);
      }

      return {
        currencyId,
        netFC,
        totalAssetsDenom,
        totalDebtsDenom,
        hasZeroHaircut: haircut === 0,
        totalAssetsLocal,
        totalDebtsLocal,
      };
    });
  }

  healthFactor() {
    // As defined here: https://docs.notional.finance/notional-v2/borrower-resources/health-factor
    const denom = this.denom(this.defaultSymbol);
    const factors = this.freeCollateralFactors();
    const hasDebt = !factors.every(({ totalDebtsLocal }) =>
      totalDebtsLocal.isZero()
    );
    const allNetFCPositive = factors.every(
      ({ totalDebtsLocal, totalAssetsLocal }) =>
        totalAssetsLocal.add(totalDebtsLocal).isPositive()
    );

    const totalPositiveFC = factors.reduce(
      (t, { totalAssetsDenom }) => t.add(totalAssetsDenom),
      TokenBalance.zero(denom)
    );
    const totalNegativeFC = factors.reduce(
      (t, { totalDebtsDenom }) => t.add(totalDebtsDenom),
      TokenBalance.zero(denom)
    );

    let health: number;
    if (!totalNegativeFC.isZero()) {
      health = totalPositiveFC.toFloat() / totalNegativeFC.abs().toFloat();
    } else if (totalNegativeFC.isZero() && hasDebt) {
      const totalPositiveFC = factors.reduce(
        (t, { totalAssetsLocal }) => t.add(totalAssetsLocal.toToken(denom)),
        TokenBalance.zero(denom)
      );
      const totalNegativeFC = factors.reduce(
        (t, { totalDebtsLocal }) => t.add(totalDebtsLocal.toToken(denom)),
        TokenBalance.zero(denom)
      );
      health = totalPositiveFC.toFloat() / totalNegativeFC.abs().toFloat();
    } else {
      return null;
    }

    if (health && hasDebt && allNetFCPositive) {
      // Apply a multiple to the health factor in the case of only local currency risk
      const a = healthFactorAdjustment.find(({ health: h }) => health <= h);
      return health * (a?.adjustment || MAX_ADJUSTMENT);
    }

    return health;
  }

  freeCollateral() {
    const denom = this.denom(this.defaultSymbol);
    const factors = this.freeCollateralFactors();
    return factors.reduce(
      (fc, { netFC }) => fc.add(netFC),
      TokenBalance.zero(denom)
    );
  }

  leverageRatio(currencyId?: number): number | null {
    let totalAssets: TokenBalance;
    let totalDebt: TokenBalance;
    if (currencyId) {
      // If currencyId is specified, then the leverage ratio
      // is specific to the denomination currency, without cross
      // currency haircuts applied.
      totalAssets = this.totalCurrencyAssets(currencyId);
      totalDebt = this.totalCurrencyDebts(currencyId);
    } else {
      totalDebt = this.totalDebt();
      totalAssets = this.totalAssets();
    }

    return totalDebt.isZero()
      ? null
      : totalDebt.neg().ratioWith(totalAssets.add(totalDebt)).toNumber() /
          RATE_PRECISION;
  }

  /***** RISK THRESHOLD *******/
  assetLiquidationThreshold(asset: TokenDefinition) {
    let riskAdjustedValue = this.netCollateralAvailable(
      asset.id
    ).toUnderlying();
    // If there is no collateral available, then the liquidation price is null
    if (this.totalDebt().isZero()) return null;
    if (riskAdjustedValue.isZero()) return null;

    // Don't show liquidation prices when the position value is dust
    if (
      this.totalDebt()
        .abs()
        .scaleTo(INTERNAL_TOKEN_DECIMALS)
        .lt(INTERNAL_PRECISION_DUST)
    )
      return null;
    if (
      riskAdjustedValue
        .abs()
        .scaleTo(INTERNAL_TOKEN_DECIMALS)
        .lt(INTERNAL_PRECISION_DUST)
    )
      return null;

    const { haircut, buffer } = this.model.getCurrencyHaircutAndBuffer(asset);

    let currencyFC: TokenBalance;
    let threshold: TokenBalance;
    let unitOfAsset: TokenBalance;

    if (asset.tokenType === 'Underlying') {
      if (riskAdjustedValue.isPositive() && haircut === 0) {
        // No cross currency liquidation price if token is haircut to zero
        return null;
      } else {
        // Apply haircut on cross currency risk
        riskAdjustedValue = riskAdjustedValue.scale(
          riskAdjustedValue.isPositive() ? haircut : buffer,
          PERCENTAGE_BASIS
        );
        currencyFC = this.freeCollateral().toToken(asset);
        unitOfAsset = TokenBalance.unit(asset);
      }
    } else {
      // In this case we're determining asset price risk and the "FC" figure is the
      // total asset's contribution to the free collateral (i.e. the net collateral
      // available of the asset's underlying.
      if (!asset.underlying) throw Error('No underlying found');
      const underlying = this.model.getTokenByID(asset.underlying);
      unitOfAsset = TokenBalance.unit(underlying);
      currencyFC = this.freeCollateral().toToken(underlying);
      const balance = this.balances.find((t) => t.tokenId === asset.id);
      if (!balance) throw Error('No risk adjusted value found');
      riskAdjustedValue = balance.toUnderlying();
    }

    if (riskAdjustedValue.isZero()) {
      return null;
    } else {
      // For exchange rate risk (when token is underlying):
      //    1 - collateralDenominatedFC / netCollateralAvailable
      //    If netCollateralAvailable < 0 then the exchange rate change will be positive
      // For asset rate risk (when token is an asset):
      //    1 - collateralDenominatedFC / positionValueNoHaircuts
      threshold = unitOfAsset.sub(
        unitOfAsset.scale(currencyFC, riskAdjustedValue)
      );
    }

    // Apply lower bounds for fCash
    if (asset.tokenType === 'fCash') {
      if (riskAdjustedValue.isPositive()) {
        const { lowestDiscountFactor } =
          this.model.getMinLendRiskAdjustedDiscountFactor(asset);

        // This is the minimum price for positive fCash
        if (threshold.lt(unitOfAsset.mulInRatePrecision(lowestDiscountFactor)))
          return null;
      } else {
        // This is the maximum price for fCash debt
        if (threshold.gt(unitOfAsset)) return null;
      }
    }

    if (
      (threshold.isNegative() ||
        threshold.isZero() ||
        threshold.toFloat() < FLOATING_POINT_DUST) &&
      (currencyFC.isPositive() || asset.tokenType !== 'Underlying')
    ) {
      // If the max exchange rate decrease is negative then there is no possible liquidation price, this can
      // happen if aggregateFC > netUnderlying.
      return null;
    }

    return threshold;
  }

  borrowCapacity(currencyId: number) {
    const usedBorrowCapacity = this.totalCurrencyDebts(currencyId);
    const netCollateralAvailable = this.netCollateralAvailable(
      usedBorrowCapacity.token.id
    );
    const fcInDebtDenomination = this.freeCollateral().toToken(
      usedBorrowCapacity.token
    );
    const { buffer: debtBuffer } = this.model.getCurrencyHaircutAndBuffer(
      this.model.getUnderlying(currencyId)
    );

    let additionalBorrowCapacity: TokenBalance;
    if (netCollateralAvailable.isPositive()) {
      if (netCollateralAvailable.gt(fcInDebtDenomination)) {
        // Limiting factor is FC, so reduce it to zero
        additionalBorrowCapacity = fcInDebtDenomination;
      } else {
        // Reduces netCollateralAvailable to zero as well as whatever additional FC is available
        const remainingFC = fcInDebtDenomination
          .sub(netCollateralAvailable)
          .scale(100, debtBuffer);
        additionalBorrowCapacity = netCollateralAvailable.add(remainingFC);
      }
    } else {
      // Any additional borrow capacity will come with a buffer attached
      additionalBorrowCapacity = fcInDebtDenomination.scale(100, debtBuffer);
    }

    return {
      usedBorrowCapacity,
      additionalBorrowCapacity,
      totalBorrowCapacity: usedBorrowCapacity.add(additionalBorrowCapacity),
    };
  }

  getAllRiskFactors() {
    return {
      netWorth: this.netWorth(),
      freeCollateral: this.freeCollateral(),
      loanToValue: this.loanToValue(),
      collateralRatio: this.collateralRatio(),
      leverageRatio: this.leverageRatio(),
      healthFactor: this.healthFactor(),
      liquidationPrice: this.getAllLiquidationPrices(),
    };
  }

  maxWithdraw(token: TokenDefinition): TokenBalance {
    const balance = this.collateral.find((t) => t.token.id === token.id);
    if (!balance) return TokenBalance.zero(token);

    // If the token's value is haircut to zero then we still have to take into
    // account net local
    const { haircut } = this.model.getCurrencyHaircutAndBuffer(
      balance.underlying
    );

    if (haircut === 0) {
      const totalDebts = this.totalCurrencyDebtsRiskAdjusted(
        balance.currencyId
      );
      // If there are no debts in the local currency then the entire balance is withdrawable
      if (totalDebts.isZero()) return balance;

      const netLocal = this.netCollateralAvailable(balance.tokenId);
      if (netLocal.isNegative()) return balance.copy(0);

      return netLocal.lt(balance) ? netLocal : balance;
    }

    try {
      const maxWithdraw = this.getWithdrawRequiredToMaintainRiskFactor(token, {
        riskFactor: 'freeCollateral',
        limit: TokenBalance.zero(this.denom(this.defaultSymbol)),
      });

      return maxWithdraw.neg().lt(balance) ? maxWithdraw.neg() : balance;
    } catch (e) {
      // This can throw errors when the account is very close to zero balance
      console.error(e);
      return TokenBalance.zero(token);
    }
  }
}

const healthFactorAdjustment = [
  { health: 1.01, adjustment: 1 },
  { health: 1.02, adjustment: 1.25 },
  { health: 1.03, adjustment: 1.5 },
  { health: 1.04, adjustment: 1.75 },
  { health: 1.05, adjustment: 2 },
  { health: 1.06, adjustment: 2.25 },
  { health: 1.07, adjustment: 2.5 },
  { health: 1.08, adjustment: 2.75 },
  { health: 1.09, adjustment: 3 },
  { health: 1.1, adjustment: 3.25 },
  { health: 1.11, adjustment: 3.3 },
  { health: 1.12, adjustment: 3.35 },
  { health: 1.13, adjustment: 3.4 },
  { health: 1.14, adjustment: 3.45 },
  { health: 1.15, adjustment: 3.5 },
  { health: 1.16, adjustment: 3.55 },
  { health: 1.17, adjustment: 3.6 },
  { health: 1.18, adjustment: 3.65 },
  { health: 1.19, adjustment: 3.7 },
  { health: 1.2, adjustment: 3.75 },
  { health: 1.21, adjustment: 3.8 },
  { health: 1.22, adjustment: 3.85 },
  { health: 1.23, adjustment: 3.9 },
  { health: 1.24, adjustment: 3.95 },
  { health: 1.25, adjustment: 4 },
];
const MAX_ADJUSTMENT = 4;
