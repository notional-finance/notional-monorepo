import { AggregateCall } from '@notional-finance/multicall';
import { TokenBalance } from '../../token-balance';
import { BaseLiquidityPool } from '../index';
import {
  getNowSeconds,
  getProviderFromNetwork,
  MorphoRouter,
  Network,
  NetworkId,
  SCALAR_DECIMALS,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
  UTILIZATION_ERROR,
} from '@notional-finance/util';
import { BigNumber, Contract, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import {
  Morpho,
  MorphoABI,
  MorphoAdaptiveIRMABI,
} from '@notional-finance/contracts';
import {
  ApolloClient,
  gql,
  HttpLink,
  InMemoryCache,
} from '@apollo/client/core';
import { MorphoAllocationStruct } from '@notional-finance/contracts/types/MorphoLendingRouter';

const MorphoLiquidityQuery = gql`
  query MarketByUniqueKey($marketId: String!, $chainId: Int!) {
    marketById(marketId: $marketId, chainId: $chainId) {
      reallocatableLiquidityAssets
      state {
        liquidityAssets
      }
      loanAsset {
        address
      }
      publicAllocatorSharedLiquidity {
        assets
        vault {
          address
        }
        withdrawMarket {
          marketId
          loanAsset {
            address
          }
          collateralAsset {
            address
          }
          oracle {
            address
          }
          irmAddress
          lltv
          state {
            supplyApy
          }
        }
      }
    }
  }
`;
interface MorphoLiquidityQueryResult {
  marketByUniqueKey: {
    reallocatableLiquidityAssets: TokenBalance;
    state: {
      liquidityAssets: string;
    };
    loanAsset: {
      address: string;
    };
    publicAllocatorSharedLiquidity: {
      assets: string;
      vault: {
        address: string;
      };
      withdrawMarket: {
        uniqueKey: string;
        loanAsset: {
          address: string;
        };
        collateralAsset: {
          address: string;
        };
        oracle: {
          address: string;
        };
        irmAddress: string;
        lltv: string;
        state: {
          supplyApy: number;
        };
      };
    }[];
  };
}

interface MorphoPublicAllocatorSharedLiquidity {
  // Liquidity that can be reallocated from other markets (including the flow caps)
  reallocatableLiquidityAssets: TokenBalance;
  sharedLiquidity: {
    // Liquidity that can be reallocated to this market from this vault / market combination
    assets: TokenBalance;
    morphoVault: string;
    withdrawMarket: {
      uniqueKey: string;
      marketParams: {
        loanToken: string;
        collateralToken: string;
        oracle: string;
        irm: string;
        lltv: BigNumber;
      };
      supplyApy: number;
    };
  }[];
}
interface MorphoVariableMarketParams
  extends MorphoPublicAllocatorSharedLiquidity {
  marketKey: string;
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

const ADAPTIVE_IRM = '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC';

const MARKET_PARAMS_TYPE = `tuple(address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)`;
const ALLOCATION_DATA_TYPE = `tuple(address vault, uint256 feeAmount, tuple(${MARKET_PARAMS_TYPE}, uint128 amount)[] withdrawals)`;

export abstract class MorphoVariableMarket extends BaseLiquidityPool<MorphoVariableMarketParams> {
  public static override getInitData(
    network: Network,
    marketId: string
  ): AggregateCall[] {
    const provider = getProviderFromNetwork(network);
    const morpho = new Contract(MorphoRouter[network], MorphoABI, provider);
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
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'marketKey',
        args: [],
        transform: () => marketId,
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

  public static override async getPoolParamsOffChain(
    network: Network,
    marketId: string
  ): Promise<Record<string, unknown>> {
    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'https://api.morpho.org/graphql',
      }),
      cache: new InMemoryCache(),
    });
    const { data, errors } = await client.query<MorphoLiquidityQueryResult>({
      query: MorphoLiquidityQuery,
      variables: {
        marketId: marketId,
        chainId: NetworkId[network],
      },
    });

    if (errors) throw new Error(errors[0].message);
    const reallocatableLiquidityAssets = TokenBalance.toJSON(
      BigNumber.from(data.marketByUniqueKey.reallocatableLiquidityAssets),
      data.marketByUniqueKey.loanAsset.address,
      network
    );
    const sharedLiquidity =
      data.marketByUniqueKey.publicAllocatorSharedLiquidity.map((s) => {
        return {
          assets: TokenBalance.toJSON(
            BigNumber.from(s.assets),
            s.withdrawMarket.loanAsset.address,
            network
          ),
          morphoVault: s.vault.address,
          withdrawMarket: {
            uniqueKey: s.withdrawMarket.uniqueKey,
            marketParams: {
              loanToken: s.withdrawMarket.loanAsset.address,
              collateralToken: s.withdrawMarket.collateralAsset.address,
              oracle: s.withdrawMarket.oracle.address,
              irm: s.withdrawMarket.irmAddress,
              lltv: BigNumber.from(s.withdrawMarket.lltv),
            },
            supplyApy: s.withdrawMarket.state.supplyApy,
          },
        };
      });

    return {
      reallocatableLiquidityAssets,
      sharedLiquidity,
    };
  }

  public getSpotInterestRate(): number {
    return this.getInterestRate(this.getUtilization());
  }

  protected getMinReallocateAmount() {
    return new TokenBalance(
      // BigNumber.from(1_000e6), // 1000 USD
      BigNumber.from(1e6), // 1 USD
      'USD',
      Network.all
    );
  }

  protected calculateUtilization(
    totalSupplyAssets: TokenBalance,
    totalBorrowAssets: TokenBalance
  ) {
    // Utilization is in 1e18 precision
    return totalSupplyAssets.isZero()
      ? BigNumber.from(0)
      : totalBorrowAssets
          .scaleTo(SCALAR_DECIMALS)
          .mul(SCALAR_PRECISION)
          .div(totalSupplyAssets.scaleTo(SCALAR_DECIMALS));
  }

  private getInitialReallocateLiquidityAmount(
    netSupply: TokenBalance | undefined,
    netBorrow: TokenBalance | undefined,
    targetUtilization: BigNumber
  ) {
    const totalSupplyAssets = netSupply
      ? this.poolParams.marketState.totalSupplyAssets.add(netSupply)
      : this.poolParams.marketState.totalSupplyAssets;
    const totalBorrowAssets = netBorrow
      ? this.poolParams.marketState.totalBorrowAssets.add(
          netBorrow.toUnderlying()
        )
      : this.poolParams.marketState.totalBorrowAssets;
    let amountToReallocateToKink = totalSupplyAssets.copy(0);

    const initialUtilization = this.calculateUtilization(
      totalSupplyAssets,
      totalBorrowAssets
    );

    if (
      initialUtilization.gt(targetUtilization) &&
      netBorrow?.isPositive() &&
      this.poolParams.reallocatableLiquidityAssets.isPositive()
    ) {
      // Simulate reallocating more liquidity from the reallocatable liquidity assets to this market
      // totalMarketBorrow + netBorrowAmount = TARGET_UTILIZATION * (totalMarketSupply + reallocateAmount)
      // totalMarketBorrow + newBorrowAmount - TARGET_UTILIZATION * totalMarketSupply = TARGET_UTILIZATION * reallocateAmount
      // (totalMarketBorrow + newBorrowAmount - TARGET_UTILIZATION * totalMarketSupply) / TARGET_UTILIZATION = reallocateAmount
      amountToReallocateToKink = totalBorrowAssets
        .sub(totalSupplyAssets.scale(targetUtilization, SCALAR_PRECISION))
        .scale(SCALAR_PRECISION, targetUtilization);

      if (
        amountToReallocateToKink.gt(
          this.poolParams.reallocatableLiquidityAssets
        )
      ) {
        // Cap this at the reallocatable liquidity assets
        amountToReallocateToKink = this.poolParams.reallocatableLiquidityAssets;
      }

      if (
        amountToReallocateToKink.toFiat('USD').lt(this.getMinReallocateAmount())
      ) {
        // Don't reallocate if we are below the minium reallocate amount
        amountToReallocateToKink = totalSupplyAssets.copy(0);
      }
    }

    return {
      totalSupplyAssets,
      totalBorrowAssets,
      amountToReallocateToKink,
      utilization: this.calculateUtilization(
        totalSupplyAssets,
        totalBorrowAssets
      ),
    };
  }

  private getActualReallocated(amountToReallocateToKink: TokenBalance): {
    totalReallocated: TokenBalance;
    allocations: MorphoAllocationStruct[] | undefined;
  } {
    if (amountToReallocateToKink.isZero()) {
      return {
        totalReallocated: amountToReallocateToKink,
        allocations: undefined,
      };
    }

    const sharedLiquidity = this.poolParams.sharedLiquidity.sort(
      // Sort by lowest supply APY first
      (a, b) => a.withdrawMarket.supplyApy - b.withdrawMarket.supplyApy
    );

    let allocationRequired = amountToReallocateToKink;
    const allocations: MorphoAllocationStruct[] = [];
    for (const s of sharedLiquidity) {
      if (s.assets.gte(allocationRequired)) {
        allocations.push({
          vault: s.morphoVault,
          feeAmount: 0,
          withdrawals: [
            {
              marketParams: s.withdrawMarket.marketParams,
              amount: allocationRequired.n,
            },
          ],
        });
        allocationRequired = allocationRequired.copy(0);
        break;
      } else if (s.assets.lt(allocationRequired)) {
        allocations.push({
          vault: s.morphoVault,
          feeAmount: 0,
          withdrawals: [
            {
              marketParams: s.withdrawMarket.marketParams,
              amount: s.assets.n,
            },
          ],
        });
        allocationRequired = allocationRequired.sub(s.assets);
      }
    }

    return {
      allocations,
      totalReallocated: amountToReallocateToKink.sub(allocationRequired),
    };
  }

  protected getReallocateLiquidityAmount(
    netSupply: TokenBalance | undefined,
    netBorrow: TokenBalance | undefined,
    targetUtilization: BigNumber
  ) {
    const { totalSupplyAssets, totalBorrowAssets, amountToReallocateToKink } =
      this.getInitialReallocateLiquidityAmount(
        netSupply,
        netBorrow,
        targetUtilization
      );
    const { totalReallocated, allocations } = this.getActualReallocated(
      amountToReallocateToKink
    );
    const finalSupplyAssets = totalSupplyAssets.add(totalReallocated);

    return {
      totalSupplyAssets: finalSupplyAssets,
      totalBorrowAssets,
      totalReallocated,
      utilization: this.calculateUtilization(
        finalSupplyAssets,
        totalBorrowAssets
      ),
      allocations,
    };
  }

  public getUtilizationPercent(
    netSupply?: TokenBalance,
    netBorrow?: TokenBalance
  ): number {
    return (
      parseFloat(
        ethers.utils.formatUnits(
          this.getUtilization(netSupply, netBorrow),
          SCALAR_DECIMALS
        )
      ) * 100
    );
  }

  public abstract getUtilization(
    netSupply?: TokenBalance,
    netBorrow?: TokenBalance
  ): BigNumber;

  public abstract getInterestRate(utilization: BigNumber): number;

  public abstract getAllocationData(
    netSupply?: TokenBalance,
    netBorrow?: TokenBalance
  ): MorphoAllocationStruct[] | undefined;

  public getLiquidity() {
    return (
      this.poolParams.marketState.totalSupplyAssets
        .sub(this.poolParams.marketState.totalBorrowAssets)
        // This is the total liquidity that can be reallocated to this market from other markets
        .add(this.poolParams.reallocatableLiquidityAssets)
    );
  }

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
  private readonly LN_2_INT = parseUnits(
    '0.693147180559945309',
    SCALAR_DECIMALS
  );
  private readonly LN_WEI_INT = parseUnits(
    '-41.446531673892822312',
    SCALAR_DECIMALS
  );
  private readonly WEXP_UPPER_BOUND = parseUnits(
    '93.859467695000404319',
    SCALAR_DECIMALS
  );
  private readonly WEXP_UPPER_VALUE = parseUnits(
    '57716089161558943949701069502944508345128.422502756744429568',
    SCALAR_DECIMALS
  );

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

  public getAllocationData(netSupply?: TokenBalance, netBorrow?: TokenBalance) {
    const { allocations } = this.getReallocateLiquidityAmount(
      netSupply,
      netBorrow,
      this.TARGET_UTILIZATION
    );
    return allocations;
  }

  public getUtilization(netSupply?: TokenBalance, netBorrow?: TokenBalance) {
    const { utilization, totalSupplyAssets } =
      this.getReallocateLiquidityAmount(
        netSupply,
        netBorrow,
        this.TARGET_UTILIZATION
      );

    if (totalSupplyAssets.isZero() && netBorrow?.isPositive())
      throw new Error(UTILIZATION_ERROR);

    if (utilization.lt(0) || utilization.gt(SCALAR_PRECISION)) {
      throw new Error(UTILIZATION_ERROR);
    } else {
      return utilization;
    }
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

    const rateInScalar = this.exp(
      this.curve(avgRateAtTarget, err).mul(SECONDS_IN_YEAR_ACTUAL)
    ).sub(SCALAR_PRECISION);
    return (
      parseFloat(ethers.utils.formatUnits(rateInScalar, SCALAR_DECIMALS)) * 100
    );
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
    const exp = this.exp(linearAdaptation);
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

  private exp(x: BigNumber) {
    if (x.lt(this.LN_WEI_INT)) return BigNumber.from(0);
    if (x.gte(this.WEXP_UPPER_BOUND)) return this.WEXP_UPPER_VALUE;

    const halfLn2 = this.LN_2_INT.div(2);
    const roundingAdjustment = x.lt(0) ? halfLn2.mul(-1) : halfLn2;
    const q = x.add(roundingAdjustment).div(this.LN_2_INT);
    const r = x.sub(q.mul(this.LN_2_INT));
    const expR = SCALAR_PRECISION.add(r).add(
      r.mul(r).div(SCALAR_PRECISION).div(2)
    );

    return q.gte(0) ? expR.shl(q.toNumber()) : expR.shr(q.mul(-1).toNumber());
  }
}
