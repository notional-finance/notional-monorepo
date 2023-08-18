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

    return this._toPercent(this.totalAssets(), debts.neg());
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

  freeCollateralFactors() {
    const denom = this.denom(this.defaultSymbol);

    return this.allCurrencyIds.map((currencyId) => {
      const totalAssetsLocal = this.totalCurrencyAssetsRiskAdjusted(currencyId);
      const totalDebtsLocal = this.totalCurrencyDebtsRiskAdjusted(currencyId);
      const netLocal = totalAssetsLocal.add(totalDebtsLocal);
      let netFC: TokenBalance;
      let totalAssetsETH: TokenBalance;
      let totalDebtsETH: TokenBalance;

      if (netLocal.currencyId === denom.currencyId) {
        // Handle special case when netLocal is in the denom currency
        const { haircut, buffer } =
          Registry.getConfigurationRegistry().getCurrencyHaircutAndBuffer(
            denom
          );
        netFC = netLocal
          .toUnderlying()
          .scale(netLocal.isPositive() ? haircut : buffer, PERCENTAGE_BASIS);
        totalAssetsETH = totalAssetsLocal
          .toUnderlying()
          .scale(haircut, PERCENTAGE_BASIS);
        totalDebtsETH = totalDebtsLocal
          .toUnderlying()
          .scale(buffer, PERCENTAGE_BASIS);
      } else {
        netFC = netLocal.toToken(
          denom,
          netLocal.isNegative() ? 'Debt' : 'Asset'
        );
        totalAssetsETH = totalAssetsLocal.toToken(denom, 'Asset');
        totalDebtsETH = totalDebtsLocal.toToken(denom, 'Debt');
      }

      return {
        currencyId,
        netFC,
        totalAssetsETH,
        totalDebtsETH,
      };
    });
  }

  healthFactor() {
    // As defined here: https://docs.notional.finance/notional-v2/borrower-resources/health-factor
    const denom = this.denom(this.defaultSymbol);
    const factors = this.freeCollateralFactors();
    const totalAssets = factors.reduce(
      (t, { totalAssetsETH }) => t.add(totalAssetsETH),
      TokenBalance.zero(denom)
    );
    const totalDebts = factors.reduce(
      (t, { totalDebtsETH }) => t.add(totalDebtsETH),
      TokenBalance.zero(denom)
    );
    return totalDebts.isZero()
      ? null
      : totalAssets.toFloat() / totalDebts.abs().toFloat();
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
      totalAssets = this.totalCurrencyAssetsRiskAdjusted(currencyId);
      totalDebt = this.totalCurrencyDebtsRiskAdjusted(currencyId);
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

    // If the token's value is haircut to zero then we still have to take into
    // account net local
    const { haircut } =
      Registry.getConfigurationRegistry().getCurrencyHaircutAndBuffer(
        balance.underlying
      );

    if (haircut === 0) {
      const netLocal = this.totalCurrencyAssetsRiskAdjusted(balance.currencyId)
        .add(this.totalCurrencyDebtsRiskAdjusted(balance.currencyId))
        .toToken(token);

      return netLocal.lt(balance) ? netLocal : balance;
    }

    const maxWithdraw = this.getWithdrawRequiredToMaintainRiskFactor(token, {
      riskFactor: 'freeCollateral',
      limit: TokenBalance.zero(this.denom(this.defaultSymbol)),
    });

    return maxWithdraw.neg().lt(balance) ? maxWithdraw.neg() : balance;
  }
}
