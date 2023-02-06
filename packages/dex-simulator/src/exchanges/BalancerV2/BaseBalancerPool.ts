import { BigNumber, constants } from 'ethers';
import { BaseLiquidityPool } from '../BaseLiquidityPool';

export default abstract class BaseBalancerPool<P> extends BaseLiquidityPool<P> {
  readonly LP_TOKEN_PRECISION = constants.WeiPerEther;

  constructor(
    override totalLPTokensHeld: BigNumber,
    override totalStrategyTokensGlobal: BigNumber,
    override balances: BigNumber[],
    override totalSupply: BigNumber,
    override poolParams: P
  ) {
    // Balancer pools always represent internal balances as 18 decimals
    const tokenDecimals = Array(balances.length).fill(constants.WeiPerEther);

    super(
      totalLPTokensHeld,
      totalStrategyTokensGlobal,
      tokenDecimals,
      balances,
      totalSupply,
      poolParams
    );
  }
}
