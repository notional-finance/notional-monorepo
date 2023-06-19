import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import { SingleSidedLP, SingleSidedLPParams } from './SingleSidedLP';
export { SingleSidedLP, SingleSidedLPParams };

export abstract class VaultAdapter {
  abstract getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
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
}

export type VaultMetadata = SingleSidedLPParams;
