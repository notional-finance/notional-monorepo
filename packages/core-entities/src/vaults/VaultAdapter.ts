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
    slippageFactor: number
  ): BytesLike;

  abstract getRedeemParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    slippageFactor: number
  ): BytesLike;

  abstract getPriceExposure(): {
    price: TokenBalance;
    vaultSharePrice: TokenBalance;
  }[];

  abstract getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number;

  abstract getVaultTVL(): TokenBalance;
}
