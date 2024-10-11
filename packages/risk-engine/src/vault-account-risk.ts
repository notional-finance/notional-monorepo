import {
  AccountDefinition,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  PRIME_CASH_VAULT_MATURITY,
  RATE_DECIMALS,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
  getNowSeconds,
  leveragedYield,
} from '@notional-finance/util';
import { BaseRiskProfile } from './base-risk';
import { SymbolOrID } from './types';
import {
  DeprecatedVaults,
  NetworkClientModel,
} from '@notional-finance/core-entities';
import { Instance } from 'mobx-state-tree';

export class VaultAccountRiskProfile extends BaseRiskProfile {
  static collateralToLeverageRatio(collateralRatio: number) {
    return 1 / collateralRatio;
  }

  static leverageToCollateralRatio(leverageRatio: number) {
    return 1 / leverageRatio;
  }

  static fromAccount(vaultAddress: string, account: AccountDefinition) {
    const balances = account.balances.filter(
      (t) => t.token.vaultAddress === vaultAddress
    );
    if (balances.length === 0) return undefined;

    const lastUpdateBlockTime = account.vaultLastUpdateTime
      ? account.vaultLastUpdateTime[vaultAddress]
      : 0;

    const vaultDebt = balances.find(
      (d) =>
        d.tokenType === 'VaultDebt' &&
        d.token.maturity !== PRIME_CASH_VAULT_MATURITY
    );
    const lastImpliedFixedRate = (account.accountHistory || []).find(
      (h) => h.token.id === vaultDebt?.tokenId
    )?.impliedFixedRate;

    return new VaultAccountRiskProfile(
      vaultAddress,
      balances,
      lastUpdateBlockTime,
      lastImpliedFixedRate
    );
  }

  static simulate(
    vaultAddress: string,
    from: TokenBalance[],
    apply: TokenBalance[],
    lastUpdateBlockTime = 0
  ) {
    return new VaultAccountRiskProfile(
      vaultAddress,
      [...from, ...apply],
      lastUpdateBlockTime
    );
  }

  static getAllRiskProfiles(
    model: Instance<typeof NetworkClientModel>,
    account: AccountDefinition
  ) {
    return (
      model
        // Include disabled vaults here in case the account still has a position
        .getAllListedVaults(true)
        ?.map(({ vaultAddress }) => {
          if (DeprecatedVaults.includes(vaultAddress.toLowerCase()))
            return undefined;
          return VaultAccountRiskProfile.fromAccount(vaultAddress, account);
        })
        .filter((v) => v !== undefined) as VaultAccountRiskProfile[]
    );
  }

  simulate(apply: TokenBalance[]) {
    return VaultAccountRiskProfile.simulate(
      this.vaultAddress,
      this.balances,
      apply
    );
  }

  /** Takes a set of token balances to create a new vault account risk profile */
  constructor(
    public vaultAddress: string,
    _balances: TokenBalance[],
    public lastUpdateBlockTime: number,
    public lastImpliedFixedRate?: number
  ) {
    const balances = _balances.filter(
      (t) => t.isVaultToken && t.token.vaultAddress === vaultAddress
    );

    const denom = balances.find((b) => b.tokenType === 'VaultShare')?.token
      .underlying;
    if (!denom) throw Error('Underlying not defined');

    // NOTE: this will settle balances inside
    super(balances, denom);
  }

  get vaultConfig() {
    return this.model.getVaultConfig(this.vaultAddress);
  }

  get discountFCash() {
    return this.vaultConfig.discountfCash;
  }

  get vaultLeverageFactors() {
    return this.model.getLeverageRatios(this.vaultShares.token);
  }

  get maturity() {
    return this.vaultShares.maturity;
  }

  get accruedVaultFees() {
    if (
      this.maturity === PRIME_CASH_VAULT_MATURITY &&
      this.lastUpdateBlockTime > 0
    ) {
      const annualizedFeeRate = this.model.getVaultConfig(
        this.vaultAddress
      ).feeRateBasisPoints;
      const timeSinceLastUpdate = getNowSeconds() - this.lastUpdateBlockTime;
      const feeRate = Math.floor(
        (annualizedFeeRate * timeSinceLastUpdate) / SECONDS_IN_YEAR
      );

      return this.vaultDebt.neg().mulInRatePrecision(feeRate);
    } else {
      return this.vaultDebt.copy(0);
    }
  }

  get vaultDebt() {
    return (
      this.debts.find((t) => t.tokenType === 'VaultDebt') ||
      TokenBalance.zero(
        this.model.getVaultDebt(this.vaultAddress, this.maturity)
      )
    );
  }

  get vaultCash() {
    return (
      this.balances.find((t) => t.tokenType === 'VaultCash') ||
      TokenBalance.zero(
        this.model.getVaultCash(this.vaultAddress, this.maturity)
      )
    );
  }

  get vaultAdapter() {
    return this.model.getVaultAdapter(this.vaultAddress);
  }

  get maxLeverageRatio() {
    return VaultAccountRiskProfile.collateralToLeverageRatio(
      this.vaultConfig.minCollateralRatioBasisPoints / RATE_PRECISION
    );
  }

  get vaultShares() {
    const v = this.balances.find((t) => t.tokenType === 'VaultShare');
    if (!v) throw Error('Vault Shares not found');
    return v;
  }

  get borrowAPY() {
    const market = this.model.getNotionalMarket(this.vaultDebt.currencyId);
    return this.vaultDebt.maturity === PRIME_CASH_VAULT_MATURITY
      ? market.getSpotInterestRate(this.vaultDebt.unwrapVaultToken().token)
      : this.lastImpliedFixedRate || 0;
  }

  get strategyAPY() {
    return this.vaultAdapter.getVaultAPY();
  }

  get totalAPY() {
    return leveragedYield(
      this.strategyAPY,
      this.borrowAPY,
      this.leverageRatio()
    );
  }

  protected _netCurrencyDebt() {
    return this.allCurrencyIds.map((id) => {
      const underlying = this.model.getUnderlying(id);
      const zeroUnderlying = TokenBalance.zero(underlying);

      const debt = this.debts.find((_) => _);
      let debtValue: TokenBalance;
      if (!debt) {
        debtValue = zeroUnderlying;
      } else if (debt.maturity === PRIME_CASH_VAULT_MATURITY) {
        // Do a direct conversion for prime debt
        debtValue = debt.toToken(underlying);
      } else if (this.discountFCash) {
        // If fCash is discounted then use discounting
        debtValue = debt.toToken(underlying, 'Debt');
      } else {
        // Otherwise convert 1-1 to underlying
        debtValue = TokenBalance.from(debt.n, underlying).scaleFromInternal();
      }

      const cash =
        this.balances
          .find((t) => t.token.currencyId === id && t.tokenType == 'VaultCash')
          ?.toUnderlying() || zeroUnderlying;

      return debtValue.add(cash);
    });
  }

  totalAssetsRiskAdjusted(denominated = this.defaultSymbol) {
    const denom = this.denom(denominated);
    const vaultShareValue = this.vaultShares.toUnderlying();

    return this._netCurrencyDebt()
      .map((netDebt) => {
        return netDebt.isPositive()
          ? netDebt.toToken(denom)
          : TokenBalance.from(0, denom);
      })
      .reduce(VaultAccountRiskProfile._sum, vaultShareValue);
  }

  /** Total debt with risk adjustments */
  totalDebtRiskAdjusted(denominated = this.defaultSymbol) {
    const denom = this.denom(denominated);

    return this._netCurrencyDebt()
      .map((netDebt) => {
        return netDebt.isPositive()
          ? TokenBalance.zero(denom)
          : netDebt.toToken(denom);
      })
      .reduce(VaultAccountRiskProfile._sum, TokenBalance.zero(denom));
  }

  collateralRatio(): number | null {
    const totalDebt = this.totalDebtRiskAdjusted().neg();
    const totalAssets = this.totalAssetsRiskAdjusted();
    return totalDebt.isZero()
      ? null
      : totalAssets.sub(totalDebt).ratioWith(totalDebt).toNumber() /
          RATE_PRECISION;
  }

  assetLiquidationThreshold(asset: TokenDefinition): TokenBalance | null {
    if (this.vaultShares.isZero() || this.vaultDebt.isZero()) return null;

    // (minCollateralRatio + 1) * debtOutstanding = vaultSharesValue
    const vaultConfig = this.model.getVaultConfig(this.vaultAddress);
    // NOTE: this value is in primary borrow underlying terms
    const oneVaultShareValueAtLiquidation = this.totalDebtRiskAdjusted()
      .neg()
      .scale(
        vaultConfig.minCollateralRatioBasisPoints + RATE_PRECISION,
        this.vaultShares.scaleTo(RATE_DECIMALS)
      );

    // This is the relative exchange rate decrease of vault shares to liquidation
    const oneVaultShareValue = TokenBalance.unit(
      this.vaultShares.token
    ).toUnderlying();
    const liquidationPriceRatio =
      oneVaultShareValueAtLiquidation.ratioWith(oneVaultShareValue);
    const assetToUnderlyingPrice = TokenBalance.unit(
      oneVaultShareValue.token
    ).toToken(asset);

    return assetToUnderlyingPrice.mulInRatePrecision(liquidationPriceRatio);
  }

  override getAllLiquidationPrices() {
    const borrowedToken = this.vaultAdapter.borrowedToken;

    return this.vaultAdapter
      .getLiquidationPriceTokens()
      .map((asset) => {
        return {
          asset,
          debt: borrowedToken,
          threshold: this.assetLiquidationThreshold(asset),
          isDebtThreshold: false,
        };
      })
      .filter(({ threshold }) => threshold !== null);
  }

  freeCollateral(): TokenBalance {
    throw new Error('Method not implemented.');
  }

  healthFactor() {
    const leverageRatio = this.leverageRatio();
    if (leverageRatio !== null) {
      // Scales the leverage ratio to 1-5 health factor
      return 5 - (4 * (leverageRatio - 1)) / (this.maxLeverageRatio - 1);
    }

    return null;
  }

  netCollateralAvailable(_collateral: SymbolOrID): TokenBalance {
    return this.totalAssetsRiskAdjusted().sub(this.totalDebtRiskAdjusted());
  }

  leverageRatio() {
    const collateralRatio = this.collateralRatio();
    if (collateralRatio) {
      return 1 / collateralRatio;
    } else if (collateralRatio === 0) {
      return Infinity;
    } else {
      return null;
    }
  }

  aboveMaxLeverageRatio() {
    const leverage = this.leverageRatio();
    return (
      leverage !== null && leverage > this.vaultLeverageFactors.maxLeverageRatio
    );
  }

  getAllRiskFactors() {
    return {
      netWorth: this.netWorth(),
      debts: this.totalDebt(),
      assets: this.totalAssets(),
      collateralRatio: this.collateralRatio(),
      liquidationPrice: this.getAllLiquidationPrices(),
      aboveMaxLeverageRatio: this.aboveMaxLeverageRatio(),
      leverageRatio: this.leverageRatio(),
      healthFactor: this.healthFactor(),
    };
  }

  maxWithdraw(_token: TokenDefinition = this.vaultShares.token) {
    let costToRepay: TokenBalance | undefined;
    let debtFee: TokenBalance | undefined;
    if (this.vaultDebt.maturity !== PRIME_CASH_VAULT_MATURITY) {
      const fCash = this.model.getfCashMarket(this.vaultDebt.currencyId);

      try {
        const { tokensOut, feesPaid } = fCash.calculateTokenTrade(
          this.vaultDebt.unwrapVaultToken(),
          0
        );
        debtFee = feesPaid[0];

        costToRepay = tokensOut
          .add(this.vaultCash.unwrapVaultToken())
          .toUnderlying()
          .neg();
      } catch {
        costToRepay = undefined;
      }
    }

    if (!costToRepay) {
      // If the trading fails or the debt is in prime debt, repay at a
      // 1-1 prime cash price
      costToRepay = this.vaultDebt
        .unwrapVaultToken()
        .toPrimeCash()
        .add(this.vaultCash.unwrapVaultToken())
        .toUnderlying()
        .neg();
    }

    // Vault shares burned to repay debt
    const { netVaultSharesForUnderlying } =
      this.vaultAdapter.getNetVaultSharesMinted(
        costToRepay, // this is a negative number
        this.vaultShares.token
      );
    const { netUnderlyingForVaultShares, feesPaid } =
      this.vaultAdapter.getNetVaultSharesCost(this.vaultShares.neg());

    // Return this in vault shares terms
    const maxWithdraw = this.vaultShares.gt(netVaultSharesForUnderlying)
      ? this.vaultShares.sub(netVaultSharesForUnderlying)
      : this.vaultShares.copy(0);

    return {
      maxWithdrawUnderlying: maxWithdraw.toUnderlying(),
      netRealizedCollateralBalance: netUnderlyingForVaultShares.add(feesPaid),
      collateralFee: feesPaid,
      debtFee,
      netRealizedDebtBalance: costToRepay.add(
        debtFee?.toUnderlying() || costToRepay.copy(0)
      ),
    };
  }
}
