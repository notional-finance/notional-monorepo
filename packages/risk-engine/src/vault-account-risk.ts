import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  RATE_DECIMALS,
  RATE_PRECISION,
  unique,
} from '@notional-finance/util';
import { BaseRiskProfile } from './base-risk';
import { SymbolOrID } from './types';

export class VaultAccountRiskProfile extends BaseRiskProfile {
  static collateralToLeverageRatio(collateralRatio: number) {
    return 1 / collateralRatio;
  }

  static leverageToCollateralRatio(leverageRatio: number) {
    return 1 / leverageRatio;
  }

  static empty(network: Network, vaultAddress: string, maturity: number) {
    const config = Registry.getConfigurationRegistry();
    const { vaultShareID } = config.getVaultIDs(
      network,
      vaultAddress,
      maturity
    );
    return new VaultAccountRiskProfile(vaultAddress, [
      TokenBalance.fromID(0, vaultShareID, network),
    ]);
  }

  static from(vaultAddress: string, balances: TokenBalance[]) {
    return new VaultAccountRiskProfile(vaultAddress, balances);
  }

  static simulate(
    vaultAddress: string,
    from: TokenBalance[],
    apply: TokenBalance[]
  ) {
    return new VaultAccountRiskProfile(vaultAddress, [...from, ...apply]);
  }

  simulate(apply: TokenBalance[]) {
    return VaultAccountRiskProfile.simulate(
      this.vaultAddress,
      this.balances,
      apply
    );
  }

  public vaultShareDefinition: TokenDefinition;
  public discountFCash: boolean;

  /** Takes a set of token balances to create a new vault account risk profile */
  constructor(public vaultAddress: string, _balances: TokenBalance[]) {
    const balances = _balances.filter(
      (t) => t.isVaultToken && t.token.vaultAddress === vaultAddress
    );
    const network = unique(balances.map((b) => b.token.network));
    const maturity = unique(balances.map((b) => b.token.maturity));

    // If initiating a new vault position, at least the dummy value of zero vault
    // shares in the proper maturity must be passed in.
    if (network.length != 1 || maturity.length != 1)
      throw Error('All balances must be in same vault, network and maturity');

    const vaultShares = balances.find((b) => b.tokenType === 'VaultShare');
    if (!vaultShares) throw Error('Vault shares not found');
    const denom = vaultShares.token.underlying;
    if (!denom) throw Error('Underlying not defined');

    super(balances, denom);

    this.vaultShareDefinition = vaultShares.token;
    this.discountFCash =
      Registry.getConfigurationRegistry().getVaultDiscountfCash(
        network[0],
        this.vaultAddress
      );
  }

  get vaultShares() {
    const v = this.balances.find((t) => t.tokenType === 'VaultShare');
    if (!v) throw Error('Vault Shares not found');
    return v;
  }

  netCurrencyDebt() {
    return this.allCurrencyIds.map((id) => {
      const underlying = Registry.getTokenRegistry().getUnderlying(
        this.network,
        id
      );
      const zeroUnderlying = TokenBalance.zero(underlying);

      const debt =
        this.balances
          .find((t) => t.token.currencyId === id && t.tokenType == 'VaultDebt')
          ?.toUnderlying() || zeroUnderlying;

      const cash =
        this.balances
          .find((t) => t.token.currencyId === id && t.tokenType == 'VaultCash')
          ?.toUnderlying() || zeroUnderlying;

      return debt.add(cash);
    });
  }

  totalAssetsRiskAdjusted(denominated = this.defaultSymbol) {
    const denom = this.denom(denominated);
    const vaultShareValue =
      this.balances.find((t) => t.tokenType === 'VaultShare')?.toUnderlying() ||
      TokenBalance.zero(denom);

    return this.netCurrencyDebt()
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

    return this.netCurrencyDebt()
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

  collateralLiquidationThreshold(
    // NOTE: this parameter is unused because the returned units is always in vault share denomination
    _collateral: TokenDefinition = this.vaultShareDefinition
  ): TokenBalance | null {
    // (minCollateralRatio + 1) * debtOutstanding = vaultSharesValue
    const config = Registry.getConfigurationRegistry();
    const vaultConfig = config.getVaultConfig(this.network, this.vaultAddress);
    // NOTE: this value is in primary borrow underlying terms
    const oneVaultShareValueAtLiquidation = this.totalDebtRiskAdjusted()
      .neg()
      .scale(
        vaultConfig.minCollateralRatioBasisPoints + RATE_PRECISION,
        this.vaultShares.scaleTo(RATE_DECIMALS)
      );

    // This is the relative exchange rate decrease of vault shares to liquidation
    return oneVaultShareValueAtLiquidation.toToken(this.vaultShareDefinition);
  }

  freeCollateral(): TokenBalance {
    throw new Error('Method not implemented.');
  }

  healthFactor(): number | null {
    throw new Error('Method not implemented.');
  }

  netCollateralAvailable(_collateral: SymbolOrID): TokenBalance {
    return this.totalAssetsRiskAdjusted().sub(this.totalDebtRiskAdjusted());
  }

  leverageRatio() {
    const collateralRatio = this.collateralRatio();
    if (collateralRatio) {
      return 1 / collateralRatio;
    } else {
      return null;
    }
  }

  getAllRiskFactors() {
    return {
      netWorth: this.netWorth(),
      debts: this.totalDebt(),
      assets: this.totalAssets(),
      collateralRatio: this.collateralRatio(),
      liquidationPrice: this.getAllLiquidationPrices({
        onlyUnderlyingDebt: true,
      }),
      leverageRatio: this.leverageRatio(),
      collateralLiquidationThreshold: this.collateral.map((a) =>
        this.collateralLiquidationThreshold(a.token)
      ),
    };
  }
}
