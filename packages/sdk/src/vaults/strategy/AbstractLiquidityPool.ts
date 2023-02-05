import { BigNumber } from 'ethers';

export abstract class AbstractLiquidityPool {
  abstract readonly LP_TOKEN_PRECISION: BigNumber;

  /**
   * Calculates an EXACT_IN_SINGLE trade on the liquidity pool
   *
   * @param tokensIn amount of tokens in
   * @param tokenIndexIn index of tokens in
   * @param tokenIndexOut index of tokens out
   * @param balanceOverrides overrides default balances for ad hoc analysis
   * @returns tokensOut amount of tokens out
   * @returns feesPaid array of fees paid amounts
   */
  protected abstract calculateTokenTrade(
    tokensIn: BigNumber,
    tokenIndexIn: number,
    tokenIndexOut: number,
    balanceOverrides?: BigNumber[]
  ): {
    tokensOut: BigNumber;
    feesPaid: BigNumber[];
  };

  /**
   * Given a number of tokens to add to the pool, return the amount of lp tokens
   * received. Accounts for imbalanced pool entries.
   * @param tokensIn
   * @returns the amount of lpTokens minted
   * @returns fees paid in each corresponding token balance
   */
  protected abstract getLPTokensGivenTokens(tokensIn: BigNumber[]): {
    lpTokens: BigNumber;
    feesPaid: BigNumber[];
  };

  /**
   * Returns the amount of tokens to receive when exiting a pool, accounts for
   * single sided exits.
   *
   * @param lpTokens
   * @param singleSidedExitTokenIndex
   * @returns tokensOut the amount of each token received
   * @returns feesPaid the amount of fees paid in each token
   */
  protected abstract getTokensOutGivenLPTokens(
    lpTokens: BigNumber,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: BigNumber[];
    feesPaid: BigNumber[];
  };
}
