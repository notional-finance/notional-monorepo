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

export class VaultAccountRiskProfile extends BaseRiskProfile {
  static empty(network: Network, vaultAddress: string, maturity: number) {
    const config = Registry.getConfigurationRegistry();
    const { vaultShareID } = config.getVaultIDs(
      network,
      vaultAddress,
      maturity
    );
    return new VaultAccountRiskProfile([
      TokenBalance.fromID(0, vaultShareID, network),
    ]);
  }

  static from(balances: TokenBalance[]) {
    return new VaultAccountRiskProfile(balances);
  }

  static simulate(from: TokenBalance[], apply: TokenBalance[]) {
    return new VaultAccountRiskProfile([...from, ...apply]);
  }

  simulate(apply: TokenBalance[]) {
    return VaultAccountRiskProfile.simulate(this.balances, apply);
  }

  public vaultAddress: string;
  public vaultShareDefinition: TokenDefinition;

  /** Takes a set of token balances to create a new account risk profile */
  constructor(_balances: TokenBalance[]) {
    let balances = _balances.filter((t) => t.isVaultToken);
    const vaultAddress = unique(balances.map((b) => b.token.vaultAddress));
    const network = unique(balances.map((b) => b.token.network));
    const maturity = unique(balances.map((b) => b.token.maturity));
    const vaultShares = balances.find(
      (b) => b.token.tokenType === 'VaultShare'
    );
    if (!vaultShares) throw Error('Vault Shares undefined');

    // If initiating a new vault position, at least the dummy value of zero vault
    // shares in the proper maturity must be passed in.
    if (vaultAddress.length != 1 || network.length != 1 || maturity.length != 1)
      throw Error('All balances must be in same vault, network and maturity');

    const config = Registry.getConfigurationRegistry();
    const nonVaultAssets = VaultAccountRiskProfile.merge(
      _balances.filter((t) => !t.isVaultToken)
    );

    if (nonVaultAssets.length > 0) {
      // Assert that all non vault assets are in underlying of the borrow currencies used
      // by the vault. All underlying tokens supplied here will be converted to vault shares.
      // If debt must be repaid then a positive token balance for the given debt amount should
      // be applied in the `simulate` method.
      const { validCurrencyIds } = config.getValidVaultCurrencies(
        network[0],
        vaultAddress[0] as string
      );

      if (
        nonVaultAssets.find(
          (t) =>
            t.token.tokenType !== 'Underlying' ||
            !validCurrencyIds.includes(t.token.currencyId)
        )
      ) {
        throw Error('Invalid non vault token');
      }

      // NOTE: this should convert to a token via the spot rate, accounting for slippage, etc.
      const mintedVaultShares = nonVaultAssets
        .map((t) => t.toTokenViaExchange(vaultShares.token))
        .reduce(
          VaultAccountRiskProfile._sum,
          TokenBalance.zero(vaultShares.token)
        );

      balances = [...balances, mintedVaultShares];
    }

    super(balances, vaultShares.tokenId);

    this.vaultShareDefinition = vaultShares.token;
    this.vaultAddress = vaultAddress[0] as string;
  }

  get vaultShares() {
    const v = this.balances.find((t) => t.token.tokenType === 'VaultShare');
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
          .find(
            (t) => t.token.currencyId === id && t.token.tokenType == 'VaultDebt'
          )
          // TODO: this does not work...check disount to pv here..
          ?.toUnderlying() || zeroUnderlying;

      const cash =
        this.balances
          .find(
            (t) => t.token.currencyId === id && t.token.tokenType == 'VaultCash'
          )
          ?.toUnderlying() || zeroUnderlying;

      return debt.add(cash);
    });
  }

  totalAssetsRiskAdjusted(denominated = this.defaultSymbol) {
    const denom = this.denom(denominated);
    const vaultShareValue =
      this.balances
        .find((t) => t.token.tokenType === 'VaultShare')
        ?.toUnderlying() || TokenBalance.zero(denom);

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
    return (
      totalAssets.sub(totalDebt).ratioWith(totalDebt).toNumber() /
      RATE_PRECISION
    );
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
    return TokenBalance.unit(this.vaultShareDefinition).sub(
      oneVaultShareValueAtLiquidation.toToken(this.vaultShareDefinition)
    );
  }

  freeCollateral(): TokenBalance {
    throw new Error('Method not implemented.');
  }

  healthFactor(): number | null {
    throw new Error('Method not implemented.');
  }
}
