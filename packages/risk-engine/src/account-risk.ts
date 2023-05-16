import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { RATE_PRECISION } from '@notional-finance/util';
import { BaseRiskProfile } from './base-risk';
import { SymbolOrID } from './types';

export class AccountRiskProfile extends BaseRiskProfile {
  static from(balances: TokenBalance[]) {
    return new AccountRiskProfile(balances);
  }

  static simulate(from: TokenBalance[], apply: TokenBalance[]) {
    return new AccountRiskProfile([...from, ...apply]);
  }

  simulate(apply: TokenBalance[]) {
    return AccountRiskProfile.simulate(this.balances, apply);
  }

  /** Takes a set of token balances to create a new account risk profile */
  constructor(_balances: TokenBalance[]) {
    const balances = _balances.filter(
      (t) =>
        // Exclude these token types from the account risk profile
        t.token.vaultAddress === undefined &&
        t.token.tokenType !== 'Underlying' &&
        t.token.tokenType !== 'Fiat'
    );

    super(balances, 'ETH');
  }

  protected _totalRiskAdjusted(b: TokenBalance[], d: TokenDefinition) {
    return this._totalValue(
      b.map((t) => t.toRiskAdjustedUnderlying()),
      d
    );
  }

  /***** RISK RATIOS *******/
  collateralRatio() {
    const debts = this.totalDebt();
    if (debts.isZero()) return null;

    return (
      this.totalAssets().ratioWith(debts).abs().toNumber() / RATE_PRECISION
    );
  }

  healthFactor() {
    const debts = this.totalDebtRiskAdjusted();
    if (debts.isZero()) return null;

    return (
      this.totalAssetsRiskAdjusted().ratioWith(debts).abs().toNumber() /
      RATE_PRECISION
    );
  }

  /** Total value of all assets with a risk adjustment */
  totalAssetsRiskAdjusted(denominated = this.defaultSymbol) {
    return this._totalRiskAdjusted(this.assets, this.denom(denominated));
  }

  /** Total debt with risk adjustments */
  totalDebtRiskAdjusted(denominated = this.defaultSymbol) {
    return this._totalRiskAdjusted(this.debts, this.denom(denominated));
  }

  /** Total value of assets in the specified currency */
  totalCurrencyAssets(currencyId: number, denominated = this.defaultSymbol) {
    return this._totalValue(
      this.assets.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
    );
  }

  /** Total value of assets in the specified currency with risk adjustments */
  totalCurrencyAssetsRiskAdjusted(
    currencyId: number,
    denominated = this.defaultSymbol
  ) {
    return this._totalRiskAdjusted(
      this.assets.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
    );
  }

  /** Total value of debts in the specified currency with risk adjustments */
  totalCurrencyDebtsRiskAdjusted(
    currencyId: number,
    denominated = this.defaultSymbol
  ) {
    return this._totalRiskAdjusted(
      this.debts.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
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

  /** Returns summary values per currency for the risk profile */
  perCurrencyFactors(denominated = this.defaultSymbol) {
    return this.allCurrencyIds.reduce(
      (m, id) => {
        m.set(id, {
          totalAssets: this.totalCurrencyAssets(id, denominated),
          totalAssetsRiskAdjusted: this.totalCurrencyAssetsRiskAdjusted(
            id,
            denominated
          ),
          totalDebts: this.totalCurrencyDebts(id, denominated),
          totalDebtsRiskAdjusted: this.totalCurrencyDebtsRiskAdjusted(
            id,
            denominated
          ),
        });

        return m;
      },
      new Map<
        number,
        {
          totalAssets: TokenBalance;
          totalAssetsRiskAdjusted: TokenBalance;
          totalDebts: TokenBalance;
          totalDebtsRiskAdjusted: TokenBalance;
        }
      >()
    );
  }

  freeCollateral() {
    return this.totalAssetsRiskAdjusted().sub(this.totalDebtRiskAdjusted());
  }

  /***** RISK THRESHOLD *******/
  collateralLiquidationThreshold(collateral: TokenDefinition) {
    const netCollateralAvailable = this.netCollateralAvailable(collateral.id);
    // If there is no collateral available, then the liquidation price is null
    if (netCollateralAvailable.isZero()) return null;

    const collateralDenominatedFC = this.freeCollateral().toToken(collateral);

    // 1 - collateralDenominatedFC / netCollateralAvailable
    const maxExchangeRateDecrease = TokenBalance.unit(collateral).sub(
      TokenBalance.unit(collateral).scale(
        collateralDenominatedFC,
        netCollateralAvailable
      )
    );

    if (
      maxExchangeRateDecrease.isNegative() &&
      collateralDenominatedFC.isPositive()
    ) {
      // If the max exchange rate decrease is negative then there is no possible liquidation price, this can
      // happen if aggregateFC > netUnderlying.
      return null;
    }

    return maxExchangeRateDecrease;
  }

  borrowCapacity(currencyId: number) {
    const usedBorrowCapacity = this.totalCurrencyDebts(currencyId);
    const netCollateralAvailable = this.netCollateralAvailable(
      usedBorrowCapacity.token.id
    );
    const fcInDebtDenomination = this.freeCollateral().toToken(
      usedBorrowCapacity.token
    );
    const debtBuffer = Registry.getConfigurationRegistry().getDebtBuffer(
      this.network,
      currencyId
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
}
