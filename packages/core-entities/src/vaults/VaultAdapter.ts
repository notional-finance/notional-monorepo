import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import { ExchangeRate, TokenDefinition } from '../Definitions';

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
    public vaultAddress: string
  ) {
    // NO-OP
  }

  getBorrowedToken() {
    return Registry.getTokenRegistry().getTokenByID(
      this.network,
      Registry.getConfigurationRegistry().getVaultConfig(
        this.network,
        this.vaultAddress
      ).primaryBorrowCurrency.id
    );
  }

  abstract getInitialVaultShareValuation(maturity: number): ExchangeRate;

  abstract convertToPrimeVaultShares(vaultShares: TokenBalance): TokenBalance;

  abstract getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  };

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

  getVaultTVL(): TokenBalance {
    const vaultShares = Registry.getTokenRegistry()
      .getAllTokens(this.network)
      .filter(
        (t) =>
          t.tokenType === 'VaultShare' && t.vaultAddress === this.vaultAddress
      );

    return vaultShares.reduce(
      (acc, v) => (v.totalSupply ? acc.add(v.totalSupply.toUnderlying()) : acc),
      TokenBalance.zero(this.getBorrowedToken())
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
