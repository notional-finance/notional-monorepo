import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import { ExchangeRate, TokenDefinition } from '../Definitions';
import { getNetworkModel } from '../Models';

export interface BaseVaultParams {
  vaultAddress: string;
  enabled: boolean;
  name: string;
}

export abstract class VaultAdapter {
  abstract get hashKey(): string;
  abstract get strategy(): string;

  constructor(
    public enabled: boolean,
    public name: string,
    public network: Network,
    public vaultAddress: string,
    public borrowedToken: TokenDefinition
  ) {
    // NO-OP
  }

  abstract getInitialVaultShareValuation(maturity: number): ExchangeRate;

  abstract convertToPrimeVaultShares(vaultShares: TokenBalance): TokenBalance;

  /**
   * Returns the underlying received when redeeming a negative amount of vault shares
   * @returns netUnderlyingForVaultShares and feesPaid
   */
  abstract getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  };

  /**
   * Returns the vault shares or redeemed for a given amount of underlying
   * @returns netVaultSharesForUnderlying and feesPaid
   */
  abstract getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  };

  abstract getDepositParameters(
    account: string,
    maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getRedeemParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number;

  getRewardAPY(): number {
    return 0;
  }

  getVaultTVL(): TokenBalance {
    const vaultShares = getNetworkModel(this.network)
      .getTokensByType('VaultShare')
      .filter((t) => t.vaultAddress === this.vaultAddress);

    return vaultShares.reduce(
      (acc, v) => (v.totalSupply ? acc.add(v.totalSupply.toUnderlying()) : acc),
      TokenBalance.zero(this.borrowedToken)
    );
  }

  getPointMultiples(): Record<string, number> | undefined {
    return undefined;
  }

  getMaxCollateralSlippage(): number | null {
    return null;
  }

  abstract getLiquidationPriceTokens(): TokenDefinition[];
}
