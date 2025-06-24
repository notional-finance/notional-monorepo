import { AggregateCall } from '@notional-finance/multicall';
import { TokenBalance } from '../../token-balance';
import { BaseLiquidityPool } from '../index';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
  SCALAR_DECIMALS,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import {
  Morpho,
  MorphoABI,
  MorphoAdaptiveIRMABI,
} from '@notional-finance/contracts';

interface MorphoVariableMarketParams {
  marketParams: {
    loanToken: string;
    collateralToken: string;
    oracle: string;
    ltv: BigNumber;
  };
  marketState: {
    totalSupplyAssets: TokenBalance;
    totalSupplyShares: BigNumber;
    totalBorrowAssets: TokenBalance;
    totalBorrowShares: BigNumber;
    lastUpdate: number;
  };
  rateAtTarget: BigNumber;
}

const MORPHO = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb';
const ADAPTIVE_IRM = '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC';

abstract class MorphoVariableMarket extends BaseLiquidityPool<MorphoVariableMarketParams> {
  public static override getInitData(
    network: Network,
    marketId: string
  ): AggregateCall[] {
    const provider = getProviderFromNetwork(network);
    const morpho = new Contract(MORPHO, MorphoABI, provider);
    const adaptiveIRM = new Contract(
      ADAPTIVE_IRM,
      MorphoAdaptiveIRMABI,
      provider
    );

    const calls: AggregateCall[] = [
      {
        stage: 0,
        target: morpho,
        method: 'idToMarketParams',
        key: 'marketParams',
        args: [marketId],
      },
      {
        stage: 0,
        target: adaptiveIRM,
        method: 'rateAtTarget',
        key: 'rateAtTarget',
        args: [marketId],
      },
      {
        stage: 1,
        target: morpho,
        method: 'market',
        key: 'marketState',
        args: [marketId],
        transform: (r: Awaited<ReturnType<Morpho['market']>>, prevResults) => {
          const loanToken = (
            prevResults[`${marketId}.marketParams`] as {
              loanToken: string;
            }
          ).loanToken;

          return {
            totalSupplyAssets: TokenBalance.toJSON(
              r.totalSupplyAssets,
              loanToken,
              network
            ),
            totalSupplyShares: r.totalSupplyShares,
            totalBorrowAssets: TokenBalance.toJSON(
              r.totalBorrowAssets,
              loanToken,
              network
            ),
            totalBorrowShares: r.totalBorrowShares,
            lastUpdate: r.lastUpdate,
          };
        },
      },
      {
        stage: 2,
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'totalSupply',
        args: [],
        transform: (_, prevResults) => {
          return (prevResults[`${marketId}.marketState`] as any)
            .totalSupplyAssets;
        },
      },
      {
        stage: 2,
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'balances',
        args: [],
        transform: (_, prevResults) => {
          return [
            (prevResults[`${marketId}.marketState`] as any).totalSupplyAssets,
            (prevResults[`${marketId}.marketState`] as any).totalBorrowAssets,
          ];
        },
      },
    ];

    return calls;
  }

  public abstract getUtilization(
    netSupply?: TokenBalance,
    netBorrow?: TokenBalance
  ): BigNumber;

  public abstract getInterestRate(utilization: BigNumber): BigNumber;

  public override calculateTokenTrade(
    _tokensIn: TokenBalance,
    _tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[] | undefined
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }

  public override getLPTokensGivenTokens(_tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
  } {
    throw new Error('Method not implemented.');
  }

  public override getTokensOutGivenLPTokens(
    _lpTokens: TokenBalance,
    _singleSidedExitTokenIndex?: number | undefined
  ): { tokensOut: TokenBalance[]; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }
}

export class MorphoAdaptiveIRM extends MorphoVariableMarket {
  // 0.9e18
  public TARGET_UTILIZATION = SCALAR_PRECISION.mul(90).div(100);
  // 4% APY on a per second basis
  public INITIAL_RATE_AT_TARGET = SCALAR_PRECISION.mul(4)
    .div(100)
    .div(SECONDS_IN_YEAR_ACTUAL);

  public ADJUSTMENT_SPEED = SCALAR_PRECISION.mul(50).div(
    SECONDS_IN_YEAR_ACTUAL
  );

  // 0.1% APY on a per second basis
  public MIN_RATE_AT_TARGET = SCALAR_PRECISION.mul(1)
    .div(1000)
    .div(SECONDS_IN_YEAR_ACTUAL);
  // 200% APY on a per second basis
  public MAX_RATE_AT_TARGET = SCALAR_PRECISION.mul(200).div(
    SECONDS_IN_YEAR_ACTUAL
  );

  // 4e18
  public CURVE_STEEPNESS = SCALAR_PRECISION.mul(4);

  public getUtilization(netSupply?: TokenBalance, netBorrow?: TokenBalance) {
    const totalSupplyAssets = netSupply
      ? this.poolParams.marketState.totalSupplyAssets.add(netSupply)
      : this.poolParams.marketState.totalSupplyAssets;
    const totalBorrowAssets = netBorrow
      ? this.poolParams.marketState.totalBorrowAssets.add(netBorrow)
      : this.poolParams.marketState.totalBorrowAssets;

    // Utilization is in 1e18 precision
    return totalBorrowAssets
      .scaleTo(SCALAR_DECIMALS)
      .mul(SCALAR_PRECISION)
      .div(totalSupplyAssets.scaleTo(SCALAR_DECIMALS));
  }

  public getInterestRate(utilization: BigNumber) {
    const errNormFactor = utilization.gt(this.TARGET_UTILIZATION)
      ? SCALAR_PRECISION.sub(this.TARGET_UTILIZATION)
      : this.TARGET_UTILIZATION;
    const err = utilization
      .sub(this.TARGET_UTILIZATION)
      .mul(SCALAR_PRECISION)
      .div(errNormFactor);

    const startRateAtTarget = this.poolParams.rateAtTarget;

    let avgRateAtTarget: BigNumber;
    let endRateAtTarget: BigNumber;
    if (startRateAtTarget.eq(0)) {
      avgRateAtTarget = this.INITIAL_RATE_AT_TARGET;
      endRateAtTarget = this.INITIAL_RATE_AT_TARGET;
    } else {
      const speed = this.ADJUSTMENT_SPEED.mul(err).div(SCALAR_PRECISION);
      const elapsed = getNowSeconds() - this.poolParams.marketState.lastUpdate;
      const linearAdaptation = speed.mul(elapsed);
      if (linearAdaptation.eq(0)) {
        avgRateAtTarget = startRateAtTarget;
        endRateAtTarget = startRateAtTarget;
      } else {
        endRateAtTarget = this.newRateAtTarget(
          startRateAtTarget,
          linearAdaptation
        );
        const midRateAtTarget = this.newRateAtTarget(
          startRateAtTarget,
          linearAdaptation.div(2)
        );
        avgRateAtTarget = startRateAtTarget
          .add(endRateAtTarget)
          .add(midRateAtTarget.mul(2))
          .div(4);
      }
    }

    return this.curve(avgRateAtTarget, err);
  }

  private curve(rateAtTarget: BigNumber, err: BigNumber) {
    // r = ((1-1/C)*err + 1) * rateAtTarget if err < 0
    //     ((C-1)*err + 1) * rateAtTarget else.
    const coefficient = err.lt(0)
      ? SCALAR_PRECISION.sub(
          SCALAR_PRECISION.mul(SCALAR_PRECISION).div(this.CURVE_STEEPNESS)
        )
      : this.CURVE_STEEPNESS.sub(SCALAR_PRECISION);

    return coefficient
      .mul(err)
      .div(SCALAR_PRECISION)
      .add(SCALAR_PRECISION)
      .mul(rateAtTarget)
      .div(SCALAR_PRECISION);
  }

  private newRateAtTarget(
    startRateAtTarget: BigNumber,
    linearAdaptation: BigNumber
  ) {
    const exp = parseUnits(
      Math.exp(
        parseInt(formatUnits(linearAdaptation, SCALAR_DECIMALS))
      ).toString(),
      SCALAR_DECIMALS
    );
    const newRate = startRateAtTarget.mul(exp).div(SCALAR_PRECISION);

    // Bound the rate at target to the min and max rates at target
    if (newRate.lt(this.MIN_RATE_AT_TARGET)) {
      return this.MIN_RATE_AT_TARGET;
    } else if (newRate.gt(this.MAX_RATE_AT_TARGET)) {
      return this.MAX_RATE_AT_TARGET;
    } else {
      return newRate;
    }
  }
}
