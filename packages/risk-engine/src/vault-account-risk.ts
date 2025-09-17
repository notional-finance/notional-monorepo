import {
  AccountDefinition,
  TokenBalance,
  TokenDefinition,
  WithdrawRequest,
} from '@notional-finance/core-entities';
import {
  RATE_DECIMALS,
  RATE_PRECISION,
  leveragedYield,
} from '@notional-finance/util';
import { BaseRiskProfile } from './base-risk';
import { SymbolOrID } from './types';
import { NetworkClientModel } from '@notional-finance/core-entities';
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
      ? account.vaultLastUpdateTime.get(vaultAddress) || 0
      : 0;

    return new VaultAccountRiskProfile(
      vaultAddress,
      balances,
      lastUpdateBlockTime,
      account.withdrawRequests?.get(vaultAddress)
    );
  }

  static simulate(
    vaultAddress: string,
    from: TokenBalance[],
    apply: TokenBalance[],
    lastUpdateBlockTime = 0,
    withdrawRequests?: WithdrawRequest[]
  ) {
    return new VaultAccountRiskProfile(
      vaultAddress,
      [...from, ...apply],
      lastUpdateBlockTime,
      withdrawRequests
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
    public withdrawRequests: WithdrawRequest[] | undefined
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

  get vaultLeverageFactors() {
    return this.model.getLeverageRatios(this.vaultDebt.token);
  }

  get maturity() {
    return this.vaultShares.token.maturity;
  }

  get vaultDebt() {
    const d = this.balances.find((t) => t.tokenType === 'VaultDebt');
    if (!d) throw Error('Vault Debt not found');
    return d;
  }

  get lastImpliedFixedRate() {
    return undefined;
  }

  get vaultConfig() {
    return this.model.getVaultConfig(this.vaultAddress);
  }

  get vaultAdapter() {
    return this.model.getVaultAdapter(this.vaultAddress);
  }

  get maxLeverageRatio() {
    return this.vaultLeverageFactors.maxLeverageRatio;
  }

  get vaultShares() {
    const v = this.balances.find((t) => t.tokenType === 'VaultShare');
    if (!v) throw Error('Vault Shares not found');
    return v;
  }

  get borrowAPY() {
    if (this.vaultDebt.isZero()) return 0;
    return this.model.getSpotAPY(this.vaultDebt.token.id).totalAPY || 0;
  }

  get hasPendingWithdraw() {
    return !!this.withdrawRequests && this.withdrawRequests.length > 0;
  }

  get hasFinalizedWithdraw() {
    return (
      !!this.withdrawRequests &&
      this.withdrawRequests.every((w) => w.finalized || w.canFinalize === true)
    );
  }

  get strategyAPY() {
    return this.hasPendingWithdraw ? 0 : this.vaultAdapter.getVaultAPY();
  }

  get totalAPY() {
    return leveragedYield(
      this.strategyAPY,
      this.borrowAPY,
      this.leverageRatio() || 0
    );
  }

  protected _netCurrencyDebt() {
    return this.vaultDebt.toUnderlying();
  }

  totalAssetsRiskAdjusted() {
    if (this.hasPendingWithdraw) {
      if (!this.withdrawRequests || this.withdrawRequests.length === 0)
        throw Error('Withdraw requests not found');

      return this.withdrawRequests.reduce((acc, w) => {
        if (w.withdrawTokenAmount) {
          return acc.add(w.withdrawTokenAmount.toToken(acc.token));
        } else {
          return acc.add(w.yieldTokenAmount.toToken(acc.token));
        }
      }, TokenBalance.zero(this.denom(this.defaultSymbol)));
    } else {
      return this.vaultShares.toUnderlying();
    }
  }

  pendingYieldTokensForWithdraw() {
    if (!this.withdrawRequests || this.withdrawRequests.length === 0)
      throw Error('Withdraw requests not found');
    return this.withdrawRequests[0].yieldTokenAmount;
  }

  /** Total debt with risk adjustments */
  totalDebtRiskAdjusted() {
    return this.vaultDebt.toUnderlying();
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
    const shares = this.hasPendingWithdraw
      ? this.pendingYieldTokensForWithdraw()
      : this.vaultShares;

    // (minCollateralRatio + 1) * debtOutstanding = vaultSharesValue
    const { maxLeverageRatio } = this.model.getLeverageRatios(
      this.vaultDebt.token
    );
    const minCollateralRatioBasisPoints =
      VaultAccountRiskProfile.leverageToCollateralRatio(maxLeverageRatio);
    // NOTE: this value is in primary borrow underlying terms
    const oneVaultShareValueAtLiquidation = this.totalDebtRiskAdjusted()
      .neg()
      .scale(
        Math.floor(minCollateralRatioBasisPoints + RATE_PRECISION),
        shares.scaleTo(RATE_DECIMALS)
      );

    // This is the relative exchange rate decrease of vault shares to liquidation
    const oneVaultShareValue = TokenBalance.unit(shares.token).toUnderlying();
    const liquidationPriceRatio =
      oneVaultShareValueAtLiquidation.ratioWith(oneVaultShareValue);
    const assetToUnderlyingPrice = TokenBalance.unit(asset).toToken(
      oneVaultShareValue.token
    );
    const assetLiquidationThreshold = assetToUnderlyingPrice
      .mulInRatePrecision(liquidationPriceRatio)
      .toToken(asset);

    return assetLiquidationThreshold;
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
      return 0;
    }
  }

  aboveMaxLeverageRatio() {
    const leverage = this.leverageRatio();
    return (
      leverage !== null && leverage > this.vaultLeverageFactors.maxLeverageRatio
    );
  }

  override netWorth() {
    return this.totalAssets().add(this.totalDebt());
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
    const costToRepay = this.vaultDebt.toUnderlying();

    // Returns the total underlying received when redeeming all of the vault shares
    let netUnderlyingForVaultShares: TokenBalance;
    let feesPaid: TokenBalance;
    if (this.hasFinalizedWithdraw) {
      if (!this.withdrawRequests) throw Error('Withdraw requests not found');
      netUnderlyingForVaultShares = this.withdrawRequests.reduce((acc, w) => {
        if (!w.withdrawTokenAmount) throw Error('Tokens withdrawn not found');
        return acc.add(w.withdrawTokenAmount.toToken(costToRepay.token));
      }, costToRepay.copy(0));
      feesPaid = TokenBalance.zero(this.denom(this.defaultSymbol));
    } else if (this.hasPendingWithdraw) {
      throw Error('Max withdraw not supported for pending withdraws');
    } else {
      ({ netUnderlyingForVaultShares, feesPaid } =
        this.vaultAdapter.getNetVaultSharesCost(this.vaultShares.neg()));
    }

    // Returns the net amount remaining after repaying all the debt
    const maxWithdrawUnderlying = netUnderlyingForVaultShares.gt(costToRepay)
      ? netUnderlyingForVaultShares.sub(costToRepay)
      : this.vaultShares.copy(0).toUnderlying();

    return {
      maxWithdrawUnderlying: maxWithdrawUnderlying,
      netRealizedCollateralBalance: netUnderlyingForVaultShares.add(feesPaid),
      collateralFee: feesPaid,
      debtFee: costToRepay.copy(0),
      netRealizedDebtBalance: costToRepay,
    };
  }
}
