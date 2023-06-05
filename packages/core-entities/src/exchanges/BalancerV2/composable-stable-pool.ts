import {
  BalancerBoostedPool,
  BalancerBoostedPoolABI,
  BalancerVault,
  BalancerVaultABI,
  BalancerLinearPoolABI,
} from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import {
  Registry,
  SerializedTokenBalance,
  TokenBalance,
  TokenDefinition,
} from '../..';
import BaseLiquidityPool from '../base-liquidity-pool';
import FixedPoint from './fixed-point';
import MetaStablePool, { MetaStablePoolParams } from './meta-stable-pool';

interface LinearPoolBalances {
  tokens: string[];
  balances: BigNumber[];
}
interface TwoTokenMultiCallResults extends MetaStablePoolParams {
  linearPoolTokens: string[];
  linearPoolId_0: number;
  linearPoolMainIndex_0: number;
  linearPoolWrappedIndex_0: number;
  linearPoolScalingFactors_0: FixedPoint[];
  linearPoolTotalSupplies_0: BigNumber;
  linearPoolFeePercentages_0: FixedPoint;
  linearPoolTargets_0: [FixedPoint, FixedPoint];
  linearPoolBalances_0: LinearPoolBalances;
  linearPoolId_1: number;
  linearPoolMainIndex_1: number;
  linearPoolWrappedIndex_1: number;
  linearPoolScalingFactors_1: FixedPoint[];
  linearPoolTotalSupplies_1: BigNumber;
  linearPoolFeePercentages_1: FixedPoint;
  linearPoolTargets_1: [FixedPoint, FixedPoint];
  linearPoolBalances_1: LinearPoolBalances;
}

interface ThreeTokenMultiCallResults extends TwoTokenMultiCallResults {
  linearPoolId_2: number;
  linearPoolMainIndex_2: number;
  linearPoolWrappedIndex_2: number;
  linearPoolScalingFactors_2: FixedPoint[];
  linearPoolTotalSupplies_2: BigNumber;
  linearPoolFeePercentages_2: FixedPoint;
  linearPoolTargets_2: [FixedPoint, FixedPoint];
  linearPoolBalances_2: LinearPoolBalances;
}

interface ComposableStablePoolParams extends MetaStablePoolParams {
  linearPoolMainBalances: TokenBalance[];
  linearPoolMainScalingFactors: FixedPoint[];
  linearPoolWrappedBalances: TokenBalance[];
  linearPoolWrappedScalingFactors: FixedPoint[];
  linearPoolTotalSupplies: TokenBalance[];

  linearPoolFeePercentages: FixedPoint[];
  linearPoolTargets: [FixedPoint, FixedPoint][];
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
abstract class ComposableStablePool extends BaseLiquidityPool<ComposableStablePoolParams> {
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

  public override get balances() {
    // This converts all of the linear BPTs to underlying based on their scaled claims
    return this._balances.map((lp, i) =>
      this.convertLinearBPTToUnderlying(lp, i)
    );
  }

  public override getLPTokenClaims(
    lpTokens: TokenBalance,
    _balancesOverrides?: TokenBalance[]
  ): TokenBalance[] {
    const balancesOverrides = _balancesOverrides?.map((b, i) =>
      this.convertUnderlyingToLinearBPT(b, i)
    );

    return super
      .getLPTokenClaims(lpTokens, balancesOverrides || this._balances)
      .map((lp, i) => this.convertLinearBPTToUnderlying(lp, i));
  }

  protected getScaledLinearBalances(linearPoolIndex: number) {
    return {
      scaledMainBalance: FixedPoint.from(
        this.poolParams.linearPoolMainBalances[linearPoolIndex].n
      ).mulDown(this.poolParams.linearPoolMainScalingFactors[linearPoolIndex]),
      scaledWrappedBalance: FixedPoint.from(
        this.poolParams.linearPoolWrappedBalances[linearPoolIndex].n
      ).mulDown(
        this.poolParams.linearPoolWrappedScalingFactors[linearPoolIndex]
      ),
    };
  }

  protected convertLinearBPTToUnderlying(
    linearBPT: TokenBalance,
    linearPoolIndex: number
  ): TokenBalance {
    const { scaledMainBalance, scaledWrappedBalance } =
      this.getScaledLinearBalances(linearPoolIndex);
    const totalSupply =
      this.poolParams.linearPoolTotalSupplies[linearPoolIndex];

    const mainTokenClaim = scaledMainBalance
      .convertTo(this.poolParams.linearPoolMainBalances[linearPoolIndex])
      .scale(linearBPT, totalSupply);
    const wrappedTokenClaim = scaledWrappedBalance
      .convertTo(this.poolParams.linearPoolMainBalances[linearPoolIndex])
      .scale(linearBPT, totalSupply);

    return mainTokenClaim.add(wrappedTokenClaim);
  }

  protected convertUnderlyingToLinearBPT(
    underlying: TokenBalance,
    linearPoolIndex: number
  ): TokenBalance {
    const { scaledMainBalance, scaledWrappedBalance } =
      this.getScaledLinearBalances(linearPoolIndex);
    const scaledAmountIn = FixedPoint.from(underlying.n).mulDown(
      this.poolParams.linearPoolMainScalingFactors[linearPoolIndex]
    );

    return this.calcBptOutPerMainIn(
      scaledAmountIn,
      scaledMainBalance,
      scaledWrappedBalance,
      FixedPoint.from(
        this.poolParams.linearPoolTotalSupplies[linearPoolIndex].n
      ),
      this.poolParams.linearPoolFeePercentages[linearPoolIndex],
      this.poolParams.linearPoolTargets[linearPoolIndex]
    ).convertTo(this.baseMetaStablePool.balances[linearPoolIndex]);
  }

  /**
   * @param tokensIn tokens in should be denominated in "main" or underlying tokens
   */
  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    const linearBPTTokensIn = tokensIn.map((t, i) => {
      // Short circuit zero tokens in
      if (t.isZero())
        return {
          linearBPT: this.baseMetaStablePool.balances[i].copy(0),
          linearBPTWithoutFees: this.baseMetaStablePool.balances[i].copy(0),
        };

      // First calculate how many linear BPTs received given tokens in. Scale amounts to 18
      // decimals and multiply by linear pool scaling factors
      const scaledAmountIn = FixedPoint.from(t.n).mulDown(
        this.poolParams.linearPoolMainScalingFactors[i]
      );
      const { scaledMainBalance, scaledWrappedBalance } =
        this.getScaledLinearBalances(i);

      const linearBPT = this.calcBptOutPerMainIn(
        scaledAmountIn,
        scaledMainBalance,
        scaledWrappedBalance,
        FixedPoint.from(this.poolParams.linearPoolTotalSupplies[i].n),
        this.poolParams.linearPoolFeePercentages[i],
        this.poolParams.linearPoolTargets[i]
      ).convertTo(this.baseMetaStablePool.balances[i]);

      const linearBPTWithoutFees = this.calcBptOutPerMainIn(
        scaledAmountIn,
        scaledMainBalance,
        scaledWrappedBalance,
        FixedPoint.from(this.poolParams.linearPoolTotalSupplies[i].n),
        FixedPoint.from(0),
        this.poolParams.linearPoolTargets[i]
      ).convertTo(this.baseMetaStablePool.balances[i]);

      return { linearBPT, linearBPTWithoutFees };
    });

    // LP tokens returned here match the totalSupply denomination on ComposableStablePool, the
    // feesPaid are denominated in linear BPT tokens in
    const { lpTokens, feesPaid: linearBPTFees } =
      this.baseMetaStablePool.getLPTokensGivenTokens(
        linearBPTTokensIn.map(({ linearBPT }) => linearBPT)
      );

    // These are fees paid in linear bpt, need to convert to corresponding main balance by simulating
    // a bpt exit without fes
    const feesPaid = linearBPTTokensIn.map(
      ({ linearBPT, linearBPTWithoutFees }, i) => {
        const totalLinearBPTFee = linearBPTWithoutFees
          .sub(linearBPT)
          .add(linearBPTFees[i]);

        return this.convertLinearBPTToUnderlying(totalLinearBPTFee, i);
      }
    );

    const lpClaims = super.getLPTokenClaims(
      lpTokens,
      this.balances.map((b, i) =>
        b.add(
          this.convertLinearBPTToUnderlying(linearBPTTokensIn[i].linearBPT, i)
        )
      ),
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
    const { tokensOut: linearBPTOut, feesPaid: linearBPTFees } =
      this.baseMetaStablePool.getTokensOutGivenLPTokens(
        lpTokens,
        singleSidedExitTokenIndex
      );

    const tokensOut = linearBPTOut.map((bptOut, i) => {
      if (bptOut.isZero()) return this.balances[i].copy(0);

      const { scaledMainBalance, scaledWrappedBalance } =
        this.getScaledLinearBalances(i);

      return this.calcMainOutPerBptIn(
        FixedPoint.from(bptOut.n),
        scaledMainBalance,
        scaledWrappedBalance,
        FixedPoint.from(this.poolParams.linearPoolTotalSupplies[i].n),
        this.poolParams.linearPoolFeePercentages[i],
        this.poolParams.linearPoolTargets[i]
      ).convertTo(this.balances[i]);
    });

    const feesPaid = linearBPTOut.map((bptOut, i) => {
      // Calculates difference in value of the linear bpt out based on claims and actual
      // tokens out. Adds in any fees accrued on the meta stable pool
      return this.convertLinearBPTToUnderlying(bptOut, i)
        .sub(tokensOut[i])
        .add(this.convertLinearBPTToUnderlying(linearBPTFees[i], i));
    });

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
    const tokenIndexIn = this.getTokenIndex(tokensIn.token);
    const scaledAmountIn = FixedPoint.from(tokensIn.n).mulDown(
      this.poolParams.linearPoolMainScalingFactors[tokenIndexIn]
    );
    const balanceOverrides = _balanceOverrides?.map((b, i) =>
      this.convertUnderlyingToLinearBPT(b, i)
    );
    const {
      scaledMainBalance: scaledMainBalanceIn,
      scaledWrappedBalance: scaledWrappedBalanceIn,
    } = this.getScaledLinearBalances(tokenIndexIn);

    // Calculate the amount of linear BPT minted by the tokens in
    const linearBPTIn = this.calcBptOutPerMainIn(
      scaledAmountIn,
      scaledMainBalanceIn,
      scaledWrappedBalanceIn,
      FixedPoint.from(this.poolParams.linearPoolTotalSupplies[tokenIndexIn].n),
      this.poolParams.linearPoolFeePercentages[tokenIndexIn],
      this.poolParams.linearPoolTargets[tokenIndexIn]
    ).convertTo(this.baseMetaStablePool.balances[tokenIndexIn]);

    const { tokensOut: linearBPTOut, feesPaid: linearBPTFees } =
      this.baseMetaStablePool.calculateTokenTrade(
        linearBPTIn,
        tokenIndexOut,
        balanceOverrides
      );

    const {
      scaledMainBalance: scaledMainBalanceOut,
      scaledWrappedBalance: scaledWrappedBalanceOut,
    } = this.getScaledLinearBalances(tokenIndexOut);

    const tokensOut = this.calcMainOutPerBptIn(
      FixedPoint.from(linearBPTOut.n),
      scaledMainBalanceOut,
      scaledWrappedBalanceOut,
      FixedPoint.from(this.poolParams.linearPoolTotalSupplies[tokenIndexOut].n),
      this.poolParams.linearPoolFeePercentages[tokenIndexOut],
      this.poolParams.linearPoolTargets[tokenIndexOut]
    ).convertTo(this.balances[tokenIndexOut]);

    return {
      tokensOut,
      feesPaid: linearBPTFees.map((lp, i) =>
        this.convertLinearBPTToUnderlying(lp, i)
      ),
    };
  }

  /**********************************************************
   * Balancer Linear Math
   **********************************************************/

  private calcInvariant(
    nominalMainBalance: FixedPoint,
    wrappedBalance: FixedPoint
  ) {
    return nominalMainBalance.add(wrappedBalance);
  }

  private calcBptOutPerMainIn(
    mainIn: FixedPoint,
    mainBalance: FixedPoint,
    wrappedBalance: FixedPoint,
    linearPoolTotalSupply: FixedPoint,
    feePercentage: FixedPoint,
    targets: [FixedPoint, FixedPoint]
  ) {
    // Amount out, so we round down overall.

    if (linearPoolTotalSupply.isZero()) {
      // BPT typically grows in the same ratio the invariant does. The first time liquidity is added however, the
      // BPT supply is initialized to equal the invariant (which in this case is just the nominal main balance as
      // there is no wrapped balance).
      return this._toNominal(mainIn, feePercentage, targets);
    }

    const previousNominalMain = this._toNominal(
      mainBalance,
      feePercentage,
      targets
    );
    const afterNominalMain = this._toNominal(
      mainBalance.add(mainIn),
      feePercentage,
      targets
    );
    const deltaNominalMain = afterNominalMain.sub(previousNominalMain);
    const invariant = this.calcInvariant(previousNominalMain, wrappedBalance);
    return linearPoolTotalSupply
      .mul(deltaNominalMain)
      .divNoScale(invariant, false);
  }

  private calcMainOutPerBptIn(
    bptIn: FixedPoint,
    mainBalance: FixedPoint,
    wrappedBalance: FixedPoint,
    bptSupply: FixedPoint,
    feePercentage: FixedPoint,
    targets: [FixedPoint, FixedPoint]
  ) {
    // Amount out, so we round down overall.

    const previousNominalMain = this._toNominal(
      mainBalance,
      feePercentage,
      targets
    );
    const invariant = this.calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = invariant.mul(bptIn).divNoScale(bptSupply, false);
    const afterNominalMain = previousNominalMain.sub(deltaNominalMain);
    const newMainBalance = this._fromNominal(
      afterNominalMain,
      feePercentage,
      targets
    );
    return mainBalance.sub(newMainBalance);
  }

  private _toNominal(
    real: FixedPoint,
    feePercentage: FixedPoint,
    [lowerTarget, upperTarget]: [FixedPoint, FixedPoint]
  ) {
    // Fees are always rounded down: either direction would work but we need to be consistent, and rounding down
    // uses less gas.

    if (real.lt(lowerTarget)) {
      const fees = lowerTarget.sub(real).mulDown(feePercentage);
      return real.sub(fees);
    }

    if (real.lte(upperTarget)) {
      return real;
    }

    const fees = real.sub(upperTarget).mulDown(feePercentage);
    return real.sub(fees);
  }

  private _fromNominal(
    nominal: FixedPoint,
    feePercentage: FixedPoint,
    [lowerTarget, upperTarget]: [FixedPoint, FixedPoint]
  ) {
    // Since real = nominal + fees, rounding down fees is equivalent to rounding down real.

    if (nominal.lt(lowerTarget)) {
      return nominal
        .add(feePercentage.mulDown(lowerTarget))
        .divDown(FixedPoint.ONE.add(feePercentage));
    }
    if (nominal.lte(upperTarget)) {
      return nominal;
    }
    return nominal
      .sub(feePercentage.mulDown(upperTarget))
      .divDown(FixedPoint.ONE.sub(feePercentage));
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
        stage: 0,
        target: pool,
        method: 'getScalingFactors',
        key: 'scalingFactors',
        transform: (
          r: Awaited<
            ReturnType<BalancerBoostedPool['functions']['getScalingFactors']>
          >[0]
        ) => r.map(FixedPoint.from),
      },
      // This returns the linear bpt held in the main boosted pool
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
        ) =>
          r.balances
            // Skip the BPT index on the boosted pool, it is not in calculations
            .filter((_, i) => i === aggregateResults[`${poolAddress}.bptIndex`])
            .map((b, i) => {
              // These tokens are linear BPT token
              return TokenBalance.toJSON(b, r.tokens[i], network);
            }),
      },
      ...Array(this.NUM_LINEAR_POOL_TOKENS).flatMap((_, i) => {
        return [
          // This stage returns all relevant information for the each of the linear pool tokens
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getPoolId',
            key: `linearPoolId_${i}`,
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getScalingFactors',
            key: `linearPoolScalingFactors_${i}`,
            transform: (r: BigNumber[]) => r.map(FixedPoint.from),
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getVirtualSupply',
            key: `linearPoolTotalSupplies_${i}`,
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getMainIndex',
            key: `linearPoolMainIndex_${i}`,
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getWrappedIndex',
            key: `linearPoolWrappedIndex_${i}`,
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getSwapFeePercentage',
            key: `linearPoolFeePercentages_${i}`,
          },
          {
            stage: 2,
            target: (r) =>
              new Contract(
                (r[`${poolAddress}.balances`] as SerializedTokenBalance[])[
                  i
                ].tokenId,
                BalancerLinearPoolABI
              ),
            method: 'getTargets',
            key: `linearPoolTargets_${i}`,
          },
          {
            stage: 3,
            target: (r) =>
              new Contract(
                r[`${poolAddress}.vaultAddress`] as string,
                BalancerVaultABI
              ),
            method: 'getPoolTokens',
            args: (r) => [r[`${poolAddress}.linearPoolId_${i}`]],
            key: `linearPoolBalances_${i}`,
            transform: (
              r: Awaited<
                ReturnType<BalancerVault['functions']['getPoolTokens']>
              >
            ) => {
              return { tokens: r.tokens, balances: r.balances };
            },
          },
        ] as AggregateCall[];
      }),
    ];
  }
}

export class ThreeTokenComposableStablePool extends ComposableStablePool {
  protected static override NUM_LINEAR_POOL_TOKENS = 3;

  /**
   * @param _balances these are boosted pool BPT balances
   * @param _totalSupply these are boosted pool total supply figures
   * @param poolParams this matches the composable stable pool params above
   */
  constructor(
    protected override _network: Network,
    protected override _balances: TokenBalance[],
    protected override _totalSupply: TokenBalance,
    inputs: ThreeTokenMultiCallResults
  ) {
    const tokenRegistry = Registry.getTokenRegistry();
    // Multicall Inputs need to be remapped into ComposableStablePoolParams due to how Linear pools do not
    // mesh well Multicall input structure
    const mainTokenDefinitions = [
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_0.tokens[inputs.linearPoolMainIndex_0]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_1.tokens[inputs.linearPoolMainIndex_1]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_2.tokens[inputs.linearPoolMainIndex_2]
      ),
    ] as TokenDefinition[];

    const wrappedTokenDefinitions = [
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_0.tokens[inputs.linearPoolWrappedIndex_0]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_1.tokens[inputs.linearPoolWrappedIndex_1]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_2.tokens[inputs.linearPoolWrappedIndex_2]
      ),
    ] as TokenDefinition[];

    if (
      !mainTokenDefinitions.every((d) => !!d) ||
      !wrappedTokenDefinitions.every((d) => !!d)
    ) {
      throw Error('Undefined token definitions');
    }

    const poolParams = {
      linearPoolMainBalances: [
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolMainIndex_0],
          mainTokenDefinitions[0]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_1.balances[inputs.linearPoolMainIndex_1],
          mainTokenDefinitions[1]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolMainIndex_2],
          mainTokenDefinitions[2]
        ),
      ],
      linearPoolWrappedBalances: [
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolWrappedIndex_0],
          wrappedTokenDefinitions[0]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_1.balances[inputs.linearPoolWrappedIndex_1],
          wrappedTokenDefinitions[1]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolWrappedIndex_2],
          wrappedTokenDefinitions[2]
        ),
      ],
      linearPoolMainScalingFactors: [
        inputs.linearPoolScalingFactors_0[inputs.linearPoolMainIndex_0],
        inputs.linearPoolScalingFactors_1[inputs.linearPoolMainIndex_1],
        inputs.linearPoolScalingFactors_2[inputs.linearPoolMainIndex_2],
      ],
      linearPoolWrappedScalingFactors: [
        inputs.linearPoolScalingFactors_0[inputs.linearPoolWrappedIndex_0],
        inputs.linearPoolScalingFactors_1[inputs.linearPoolWrappedIndex_1],
        inputs.linearPoolScalingFactors_2[inputs.linearPoolWrappedIndex_2],
      ],
      linearPoolTotalSupplies: [
        _balances[0].copy(inputs.linearPoolTotalSupplies_0),
        _balances[1].copy(inputs.linearPoolTotalSupplies_1),
        _balances[2].copy(inputs.linearPoolTotalSupplies_2),
      ],
      linearPoolFeePercentages: [
        inputs.linearPoolFeePercentages_0,
        inputs.linearPoolFeePercentages_1,
        inputs.linearPoolFeePercentages_2,
      ],
      linearPoolTargets: [
        inputs.linearPoolTargets_0,
        inputs.linearPoolTargets_1,
        inputs.linearPoolTargets_2,
      ],
    } as ComposableStablePoolParams;

    super(_network, _balances, _totalSupply, poolParams);
  }
}

export class TwoTokenComposableStablePool extends ComposableStablePool {
  protected static override NUM_LINEAR_POOL_TOKENS = 2;

  /**
   * @param _balances these are boosted pool BPT balances
   * @param _totalSupply these are boosted pool total supply figures
   * @param poolParams this matches the composable stable pool params above
   */
  constructor(
    protected override _network: Network,
    protected override _balances: TokenBalance[],
    protected override _totalSupply: TokenBalance,
    inputs: TwoTokenMultiCallResults
  ) {
    const tokenRegistry = Registry.getTokenRegistry();
    // Multicall Inputs need to be remapped into ComposableStablePoolParams due to how Linear pools do not
    // mesh well Multicall input structure
    const mainTokenDefinitions = [
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_0.tokens[inputs.linearPoolMainIndex_0]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_1.tokens[inputs.linearPoolMainIndex_1]
      ),
    ] as TokenDefinition[];

    const wrappedTokenDefinitions = [
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_0.tokens[inputs.linearPoolWrappedIndex_0]
      ),
      tokenRegistry.getTokenByAddress(
        _network,
        inputs.linearPoolBalances_1.tokens[inputs.linearPoolWrappedIndex_1]
      ),
    ] as TokenDefinition[];

    if (
      !mainTokenDefinitions.every((d) => !!d) ||
      !wrappedTokenDefinitions.every((d) => !!d)
    ) {
      throw Error('Undefined token definitions');
    }

    const poolParams = {
      linearPoolMainBalances: [
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolMainIndex_0],
          mainTokenDefinitions[0]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_1.balances[inputs.linearPoolMainIndex_1],
          mainTokenDefinitions[1]
        ),
      ],
      linearPoolWrappedBalances: [
        TokenBalance.from(
          inputs.linearPoolBalances_0.balances[inputs.linearPoolWrappedIndex_0],
          wrappedTokenDefinitions[0]
        ),
        TokenBalance.from(
          inputs.linearPoolBalances_1.balances[inputs.linearPoolWrappedIndex_1],
          wrappedTokenDefinitions[1]
        ),
      ],
      linearPoolMainScalingFactors: [
        inputs.linearPoolScalingFactors_0[inputs.linearPoolMainIndex_0],
        inputs.linearPoolScalingFactors_1[inputs.linearPoolMainIndex_1],
      ],
      linearPoolWrappedScalingFactors: [
        inputs.linearPoolScalingFactors_0[inputs.linearPoolWrappedIndex_0],
        inputs.linearPoolScalingFactors_1[inputs.linearPoolWrappedIndex_1],
      ],
      linearPoolTotalSupplies: [
        _balances[0].copy(inputs.linearPoolTotalSupplies_0),
        _balances[1].copy(inputs.linearPoolTotalSupplies_1),
      ],
      linearPoolFeePercentages: [
        inputs.linearPoolFeePercentages_0,
        inputs.linearPoolFeePercentages_1,
      ],
      linearPoolTargets: [
        inputs.linearPoolTargets_0,
        inputs.linearPoolTargets_1,
      ],
    } as ComposableStablePoolParams;

    super(_network, _balances, _totalSupply, poolParams);
  }
}
