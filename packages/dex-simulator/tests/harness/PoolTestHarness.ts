import { BigNumber, Signer } from 'ethers';

export interface PoolTestHarness {
  singleSideEntry(
    signer: Signer,
    entryTokenIndex: number,
    entryTokenAmount: BigNumber
  ): Promise<{ lpTokens: BigNumber; feesPaid: BigNumber[] }>;

  singleSideExit(
    signer: Signer,
    exitTokenIndex: number,
    lpTokenAmount: BigNumber
  ): Promise<{ tokensOut: BigNumber; feesPaid: BigNumber[] }>;

  multiTokenEntry(
    signer: Signer,
    tokensIn: BigNumber[]
  ): Promise<{ lpTokens: BigNumber; feesPaid: BigNumber[] }>;

  multiTokenExit(
    signer: Signer,
    lpTokenAmount: BigNumber,
    minTokensOut?: BigNumber[]
  ): Promise<{ tokensOut: BigNumber[]; feesPaid: BigNumber[] }>;

  trade(
    signer: Signer,
    tokensInIndex: number,
    tokensOutIndex: number,
    tokensIn: BigNumber
  ): Promise<{ tokensOut: BigNumber; feesPaid: BigNumber[] }>;
}
