import { Contract } from 'ethers';
import { INTERNAL_TOKEN_PRECISION } from '../../../config/constants';
import { AggregateCall } from '../../../data/Multicall';
import TypedBigNumber from '../../../libs/TypedBigNumber';
import { LiquidationThreshold } from '../../../libs/types';
import {
  MetaStable2Token,
  BalancerStablePool,
} from '@notional-finance/contracts';
import VaultAccount from '../../VaultAccount';
import BalancerStableMath from './BalancerStableMath';
import {
  BaseBalancerStablePool,
  BaseBalancerStablePoolInitParams,
  PoolContext,
} from './BaseBalancerStablePool';
import FixedPoint from './FixedPoint';

import MetaStable2TokenAuraABI from '../../../abi/MetaStable2Token.json';
import BalancerStablePoolABI from '../../../abi/BalancerStablePool.json';

interface InitParams extends BaseBalancerStablePoolInitParams {
  poolContext: PoolContext;
  scalingFactors: FixedPoint[];
  amplificationParameter: FixedPoint;
  totalSupply: FixedPoint;
  swapFeePercentage: FixedPoint;
  bptPrice: FixedPoint;
  pairPrice: FixedPoint;
  // oracleContext: {
  //   bptPrice: FixedPoint;
  //   pairPrice: FixedPoint;
  // };
}

export default class MetaStable2TokenAura extends BaseBalancerStablePool<InitParams> {
  public get oraclePrice() {
    if (this.initParams.poolContext.primaryTokenIndex === 0) {
      return this.initParams.bptPrice;
      // return this.initParams.oracleContext.bptPrice;
    }
    // const { bptPrice, pairPrice } = this.initParams.oracleContext;
    const { bptPrice, pairPrice } = this.initParams;
    return bptPrice.mul(FixedPoint.ONE).div(pairPrice);
  }

  public get balances() {
    return this.initParams.poolContext.balances.map((b, i) =>
      b.mul(this.initParams.scalingFactors[i]).div(FixedPoint.ONE)
    );
  }

  public initVaultParams() {
    const vaultContract = new Contract(
      this.vaultAddress,
      MetaStable2TokenAuraABI
    ) as MetaStable2Token;
    return [
      {
        stage: 0,
        target: vaultContract,
        method: 'getStrategyContext',
        args: [],
        key: 'strategyContext',
        transform: (
          r: Awaited<ReturnType<typeof vaultContract.getStrategyContext>>
        ) => ({
          totalStrategyTokensGlobal: FixedPoint.from(
            r.baseStrategy.vaultState.totalStrategyTokenGlobal
          ),
          totalBPTHeld: FixedPoint.from(r.baseStrategy.totalBPTHeld),
        }),
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'getStrategyContext',
        args: [],
        key: 'poolContext',
        transform: (
          r: Awaited<ReturnType<typeof vaultContract.getStrategyContext>>
        ) => {
          const balances = [
            FixedPoint.from(
              r.poolContext.primaryIndex === 0
                ? r.poolContext.primaryBalance
                : r.poolContext.secondaryBalance
            ),
            FixedPoint.from(
              r.poolContext.primaryIndex === 1
                ? r.poolContext.primaryBalance
                : r.poolContext.secondaryBalance
            ),
          ];
          return {
            poolAddress: r.poolContext.basePool.pool,
            poolId: r.poolContext.basePool.poolId,
            primaryTokenIndex: r.poolContext.primaryIndex,
            tokenOutIndex: r.poolContext.secondaryIndex,
            balances,
            totalStrategyTokensGlobal: FixedPoint.from(
              r.baseStrategy.vaultState.totalStrategyTokenGlobal
            ),
            totalBPTHeld: FixedPoint.from(r.baseStrategy.totalBPTHeld),
          };
        },
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'getAmplificationParameter',
        key: 'amplificationParameter',
        transform: (
          r: Awaited<
            ReturnType<
              BalancerStablePool['functions']['getAmplificationParameter']
            >
          >
        ) => FixedPoint.from(r.value),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'getSwapFeePercentage',
        key: 'swapFeePercentage',
        transform: (
          r: Awaited<
            ReturnType<BalancerStablePool['functions']['getSwapFeePercentage']>
          >
        ) => FixedPoint.from(r),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'totalSupply',
        key: 'totalSupply',
        transform: (
          r: Awaited<ReturnType<BalancerStablePool['functions']['totalSupply']>>
        ) => FixedPoint.from(r),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'getScalingFactors',
        key: 'scalingFactors',
        transform: (
          r: Awaited<
            ReturnType<BalancerStablePool['functions']['getScalingFactors']>
          >
        ) => r.map(FixedPoint.from),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'getLatest',
        key: 'pairPrice',
        args: [0],
        transform: (
          r: Awaited<ReturnType<BalancerStablePool['functions']['getLatest']>>
        ) => FixedPoint.from(r),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
        method: 'getLatest',
        key: 'bptPrice',
        args: [1],
        transform: (
          r: Awaited<ReturnType<BalancerStablePool['functions']['getLatest']>>
        ) => FixedPoint.from(r),
      },
      // {
      //   stage: 1,
      //   target: (r) => new Contract(r.poolContext.poolAddress, BalancerStablePoolABI),
      //   key: 'oracleContext',
      //   method: 'getTimeWeightedAverage',
      //   args: [
      //     [
      //       {
      //         variable: 0, // Pair Price
      //         secs: 3600,
      //         ago: 0,
      //       },
      //       {
      //         variable: 1, // BPT Price
      //         secs: 3600,
      //         ago: 0,
      //       },
      //     ],
      //   ],
      //   transform: (r: Awaited<ReturnType<BalancerStablePool['functions']['getTimeWeightedAverage']>>) => ({
      //     pairPrice: FixedPoint.from(r[0]),
      //     bptPrice: FixedPoint.from(r[1]),
      //   }),
      // },
    ] as AggregateCall[];
  }

  public getLiquidationThresholds(
    _: VaultAccount,
    __: number
  ): Array<LiquidationThreshold> {
    return [];
  }

  protected getBPTValue(amountIn: FixedPoint = FixedPoint.ONE): FixedPoint {
    return this.oraclePrice.mul(amountIn).div(FixedPoint.ONE);
  }

  protected getBPTOut(tokenAmountIn: FixedPoint) {
    const {
      amplificationParameter,
      poolContext,
      totalSupply,
      swapFeePercentage,
    } = this.initParams;
    const { primaryTokenIndex } = poolContext;
    const { balances } = this;
    const invariant = BalancerStableMath.calculateInvariant(
      amplificationParameter,
      balances,
      true
    );
    const amountsIn = new Array<FixedPoint>(this.balances.length).fill(
      FixedPoint.from(0)
    );
    amountsIn[primaryTokenIndex] = tokenAmountIn;

    const dueProtocolFeeAmounts = this.getDueProtocolFeeAmounts(
      amplificationParameter,
      invariant,
      balances,
      swapFeePercentage
    );
    const balancesWithoutFees = balances.map((b, i) =>
      b.sub(dueProtocolFeeAmounts[i])
    );

    return BalancerStableMath.calcBptOutGivenExactTokensIn(
      amplificationParameter,
      balancesWithoutFees,
      amountsIn,
      totalSupply,
      swapFeePercentage,
      invariant
    );
  }

  /**
   * @dev Returns the amount of protocol fees to pay, given the value of the last stored invariant and the current
   * balances.
   */
  public getDueProtocolFeeAmounts(
    amplificationParameter: FixedPoint,
    invariant: FixedPoint,
    balances: FixedPoint[],
    protocolSwapFeePercentage: FixedPoint
  ) {
    // Initialize with zeros
    const numTokens = this.balances.length;
    const dueProtocolFeeAmounts = new Array<FixedPoint>(numTokens).fill(
      FixedPoint.from(0)
    );

    // Early return if the protocol swap fee percentage is zero, saving gas.
    if (protocolSwapFeePercentage.isZero()) {
      return dueProtocolFeeAmounts;
    }

    // Instead of paying the protocol swap fee in all tokens proportionally, we will pay it in a single one. This
    // will reduce gas costs for single asset joins and exits, as at most only two Pool balances will change (the
    // token joined/exited, and the token in which fees will be paid).

    // The protocol fee is charged using the token with the highest balance in the pool.
    let chosenTokenIndex = 0;
    let maxBalance = balances[0];
    for (let i = 1; i < numTokens; i += 1) {
      const currentBalance = balances[i];
      if (currentBalance.gt(maxBalance)) {
        chosenTokenIndex = i;
        maxBalance = currentBalance;
      }
    }

    // Set the fee amount to pay in the selected token
    dueProtocolFeeAmounts[chosenTokenIndex] =
      BalancerStableMath.calcDueTokenProtocolSwapFeeAmount(
        amplificationParameter,
        balances,
        invariant,
        chosenTokenIndex,
        protocolSwapFeePercentage
      );

    return dueProtocolFeeAmounts;
  }

  protected getUnderlyingOut(BPTIn: FixedPoint) {
    const {
      amplificationParameter,
      poolContext,
      totalSupply,
      swapFeePercentage,
    } = this.initParams;
    const { balances } = this;
    const invariant = BalancerStableMath.calculateInvariant(
      amplificationParameter,
      balances,
      true
    );

    const tokensOut = BalancerStableMath.calcTokenOutGivenExactBptIn(
      amplificationParameter,
      balances,
      poolContext.primaryTokenIndex,
      BPTIn,
      totalSupply,
      swapFeePercentage,
      invariant
    );

    return TypedBigNumber.fromBalance(
      tokensOut
        .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
        .div(FixedPoint.ONE).n,
      this.getPrimaryBorrowSymbol(),
      true
    );
  }
}
