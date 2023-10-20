import {
  BalancerBoostedPool,
  BalancerBoostedPoolABI,
  BalancerVault,
  BalancerVaultABI,
} from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../..';
import BaseLiquidityPool from '../base-liquidity-pool';
import FixedPoint from './fixed-point';
import MetaStablePool, { MetaStablePoolParams } from './meta-stable-pool';

export interface ComposableStablePoolParams extends MetaStablePoolParams {
  bptIndex: number;
}

/**
 * The design for the ComposableStablePool is distinct from most other liquidity pools. The ComposableStablePool
 * is a MetaStablePool that holds LinearPoolBPT tokens as its balances. User interaction will generally go via the
 * LinearPoolBPT first and then use those BPTs to join the MetaStablePool. Because BaseLiquidityPool exposes "balances"
 * and "totalSupply" publicly, these should make sense to the code calling the ComposableStablePool. (i.e. show the
 * underlying balances rather than BPT tokens).
 *
 * Therefore, in this design, the inputs and outputs will be denominated in underlying tokens (i.e. linearPoolMainToken),
 * and the code will do all the necessary conversion to underlying tokens.
 */
export class ComposableStablePool extends BaseLiquidityPool<ComposableStablePoolParams> {
  protected static NUM_LINEAR_POOL_TOKENS: number;
  private baseMetaStablePool: MetaStablePool;

  constructor(
    protected override _network: Network,
    protected override _balances: TokenBalance[],
    protected override _totalSupply: TokenBalance,
    public override poolParams: ComposableStablePoolParams
  ) {
    super(_network, _balances, _totalSupply, poolParams);

    this.baseMetaStablePool = new MetaStablePool(
      _network,
      _balances,
      _totalSupply,
      poolParams
    );
  }

  /**
   * @param tokensIn tokens in should be denominated in "main" or underlying tokens
   */
  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    // LP tokens returned here match the totalSupply denomination on ComposableStablePool, the
    // feesPaid are denominated in linear BPT tokens in
    const { lpTokens, feesPaid } =
      this.baseMetaStablePool.getLPTokensGivenTokens(tokensIn);

    const lpClaims = super.getLPTokenClaims(
      lpTokens,
      this.balances,
      this.totalSupply.add(lpTokens)
    );

    return { lpTokens, feesPaid, lpClaims };
  }

  /**
   * @param lpTokens LP tokens are denominated in baseMetaStablePool bpt
   * @param singleSidedExitTokenIndex
   */
  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    // LP tokens returned here match the totalSupply denomination on ComposableStablePool, both values
    // returned represent linear BPT tokens
    const { tokensOut, feesPaid } =
      this.baseMetaStablePool.getTokensOutGivenLPTokens(
        lpTokens,
        singleSidedExitTokenIndex
      );

    return { tokensOut, feesPaid };
  }

  /**
   * @param tokensIn represents underlying balances
   * @param tokenIndexOut  index of token out
   * @param balanceOverrides represents overrides in underlying balance terms
   */
  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ) {
    const { tokensOut, feesPaid } = this.baseMetaStablePool.calculateTokenTrade(
      tokensIn,
      tokenIndexOut,
      _balanceOverrides
    );

    return {
      tokensOut,
      feesPaid,
    };
  }

  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, BalancerBoostedPoolABI);

    return [
      {
        stage: 0,
        target: pool,
        method: 'getSwapFeePercentage',
        key: 'swapFeePercentage',
        args: [],
        transform: (r: BigNumber) => FixedPoint.from(r),
      },
      // This is the actual "virtual" supply balance on the composable pool
      {
        stage: 0,
        target: pool,
        method: 'getActualSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) =>
          TokenBalance.toJSON(r, poolAddress, network),
      },
      {
        stage: 0,
        target: pool,
        method: 'getPoolId',
        key: 'poolId',
      },
      {
        stage: 0,
        target: pool,
        method: 'getVault',
        key: 'vaultAddress',
      },
      {
        stage: 0,
        target: pool,
        method: 'getBptIndex',
        key: 'bptIndex',
      },
      {
        stage: 0,
        target: pool,
        method: 'getAmplificationParameter',
        key: 'amplificationParameter',
        transform: (
          r: Awaited<
            ReturnType<
              BalancerBoostedPool['functions']['getAmplificationParameter']
            >
          >
        ) => FixedPoint.from(r.value),
      },
      {
        stage: 1,
        target: pool,
        method: 'getScalingFactors',
        key: 'scalingFactors',
        transform: (
          r: Awaited<
            ReturnType<BalancerBoostedPool['functions']['getScalingFactors']>
          >[0],
          aggregateResults: any
        ) =>
          r
            .filter((_, i) => i != aggregateResults[`${poolAddress}.bptIndex`])
            .map(FixedPoint.from),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(
            r[`${poolAddress}.vaultAddress`] as string,
            BalancerVaultABI
          ),
        method: 'getPoolTokens',
        args: (r) => [r[`${poolAddress}.poolId`]],
        key: 'balances',
        transform: (
          r: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          aggregateResults: any
        ) => {
          const balances: any[] = [];
          for (let i = 0; i < r.balances.length; i++) {
            if (i != aggregateResults[`${poolAddress}.bptIndex`]) {
              balances.push(
                TokenBalance.toJSON(r.balances[i], r.tokens[i], network)
              );
            }
          }
          return balances;
        },
      },
    ];
  }
}
