import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { TokenBalance } from '..';

export abstract class AbstractLiquidityPool {
  public static getInitData(
    _network: Network,
    _poolAddress: string
  ): AggregateCall[] {
    throw Error('Unimplemented');
  }

  public static getPoolParamsOffChain(
    _network: Network,
    _poolAddress: string
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({});
  }

  /**
   * Calculates an EXACT_IN_SINGLE trade on the liquidity pool
   *
   * @param tokensIn amount of tokens in
   * @param tokenIndexOut index of tokens out
   * @param balanceOverrides overrides default balances for ad hoc analysis
   * @returns tokensOut amount of tokens out
   * @returns feesPaid array of fees paid amounts
   */
  public abstract calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ): {
    tokensOut: TokenBalance;
    feesPaid: TokenBalance[];
  };

  /**
   * Given a number of tokens to add to the pool, return the amount of lp tokens
   * received. Accounts for imbalanced pool entries.
   * @param tokensIn all balances must be specified in tokens in, for single sided entry
   * all other balances should be set to zero
   * @returns the amount of lpTokens minted
   * @returns fees paid in each corresponding token balance
   */
  public abstract getLPTokensGivenTokens(tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
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
  public abstract getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: TokenBalance[];
    feesPaid: TokenBalance[];
  };
}
