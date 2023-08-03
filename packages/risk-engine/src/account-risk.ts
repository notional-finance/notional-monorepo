import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  PERCENTAGE_BASIS,
  RATE_PRECISION,
} from '@notional-finance/util';
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
  constructor(_balances: TokenBalance[], _network?: Network) {
    const balances = _balances
      .map((t) => (t.tokenType === 'Underlying' ? t.toPrimeCash() : t))
      .filter(
        (t) =>
          !t.isVaultToken &&
          t.tokenType !== 'Underlying' &&
          t.tokenType !== 'Fiat'
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

    return this._toPercent(this.totalAssets(), debts);
  }

  healthFactor() {
    // As defined here: https://docs.notional.finance/notional-v2/borrower-resources/health-factor
    const factor =
      this._toPercent(this.freeCollateral(), this.netWorth()) /
      PERCENTAGE_BASIS;
    return 1 + factor * 9;
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

  /** Total value of assets in the specified currency */
  totalCurrencyAssets(currencyId: number, denominated = this.defaultSymbol) {
    return this._totalValue(
      this.collateral.filter((t) => t.token.currencyId === currencyId),
      this.denom(denominated)
    );
  }

  /** Total value of assets in the specified currency with risk adjustments */
  totalCurrencyAssetsRiskAdjusted(currencyId: number) {
    return this._totalRiskAdjusted(
      this.collateral.filter((t) => t.token.currencyId === currencyId),
      Registry.getTokenRegistry().getPrimeCash(this.network, currencyId)
    );
  }

  /** Total value of debts in the specified currency with risk adjustments */
  totalCurrencyDebtsRiskAdjusted(currencyId: number) {
    return this._totalRiskAdjusted(
      this.debts.filter((t) => t.token.currencyId === currencyId),
      Registry.getTokenRegistry().getPrimeCash(this.network, currencyId)
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
  perCurrencyFactors() {
    return this.allCurrencyIds.reduce(
      (m, id) => {
        const underlying = Registry.getTokenRegistry().getUnderlying(
          this.network,
          id
        ).id;
        m.set(id, {
          totalAssets: this.totalCurrencyAssets(id, underlying),
          totalAssetsRiskAdjusted: this.totalCurrencyAssetsRiskAdjusted(id),
          totalDebts: this.totalCurrencyDebts(id, underlying),
          totalDebtsRiskAdjusted: this.totalCurrencyDebtsRiskAdjusted(id),
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
    const denom = this.denom(this.defaultSymbol);
    return this.allCurrencyIds.reduce((fc, id) => {
      const netLocal = this.totalCurrencyAssetsRiskAdjusted(id).add(
        this.totalCurrencyDebtsRiskAdjusted(id)
      );

      let netFC: TokenBalance;
      if (netLocal.currencyId === denom.currencyId) {
        // Handle special case when netLocal is in the denom currency
        const { haircut, buffer } =
          Registry.getConfigurationRegistry().getCurrencyHaircutAndBuffer(
            denom
          );
        netFC = netLocal
          .toUnderlying()
          .scale(netLocal.isPositive() ? haircut : buffer, PERCENTAGE_BASIS);
      } else {
        netFC = netLocal.toToken(
          denom,
          netLocal.isNegative() ? 'Debt' : 'Asset'
        );
      }

      return fc.add(netFC);
    }, TokenBalance.zero(denom));
  }

  leverageRatio(): number | null {
    const totalDebt = this.totalDebt().neg();
    const totalAssets = this.totalAssets();
    return totalDebt.isZero()
      ? null
      : totalDebt.ratioWith(totalAssets.sub(totalDebt)).toNumber() /
          RATE_PRECISION;
  }

  /***** RISK THRESHOLD *******/
  collateralLiquidationThreshold(collateral: TokenDefinition) {
    const netCollateralAvailable = this.netCollateralAvailable(collateral.id);
    // If there is no collateral available, then the liquidation price is null
    if (this.totalDebt().isZero()) return null;
    if (netCollateralAvailable.isZero()) return null;

    const collateralDenominatedFC = this.freeCollateral().toToken(collateral);

    // 1 - collateralDenominatedFC / netCollateralAvailable
    const maxExchangeRateDecrease = TokenBalance.unit(collateral).sub(
      TokenBalance.unit(collateral).scale(
        collateralDenominatedFC,
        netCollateralAvailable
      )
    );

    if (collateral.tokenType === 'nToken') {
      const { nTokenMaxDrawdown } =
        Registry.getConfigurationRegistry().getNTokenLeverageFactors(
          collateral
        );

      // This is the minimum price for an nToken
      if (
        maxExchangeRateDecrease.lt(
          TokenBalance.unit(collateral).mulInRatePrecision(nTokenMaxDrawdown)
        )
      )
        return null;
    }

    if (
      (maxExchangeRateDecrease.isNegative() ||
        maxExchangeRateDecrease.isZero()) &&
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

  getAllRiskFactors() {
    return {
      netWorth: this.netWorth(),
      freeCollateral: this.freeCollateral(),
      loanToValue: this.loanToValue(),
      collateralRatio: this.collateralRatio(),
      leverageRatio: this.leverageRatio(),
      healthFactor: this.healthFactor(),
      liquidationPrice: this.getAllLiquidationPrices({
        onlyUnderlyingDebt: false,
      }),
      collateralLiquidationThreshold: this.collateral.map((a) =>
        this.collateralLiquidationThreshold(a.token)
      ),
    };
  }

  override maxWithdraw(token: TokenDefinition): TokenBalance {
    const balance = this.collateral.find((t) => t.token.id === token.id);
    if (!balance) return TokenBalance.zero(token);

    const maxWithdraw = this.getWithdrawRequiredToMaintainRiskFactor(token, {
      riskFactor: 'freeCollateral',
      limit: TokenBalance.zero(this.denom(this.defaultSymbol)),
    });

    return maxWithdraw.neg().lt(balance) ? maxWithdraw.neg() : balance;
  }
}
