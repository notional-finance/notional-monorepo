import { Contract, utils } from 'ethers';
import {
  BASIS_POINT,
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '../../../config/constants';
import { AggregateCall } from '../../../data/Multicall';
import TypedBigNumber from '../../../libs/TypedBigNumber';
import {
  LiquidationThreshold,
  LiquidationThresholdType,
} from '../../../libs/types';
import { DexId, DexTradeType } from '../../../trading/TradeHandler';
import {
  BalancerStablePool,
  MetaStable2TokenAuraVault,
  MetaStable2TokenAuraVaultABI,
  BalancerStablePoolABI,
  TradingModule,
  TradingModuleABI,
} from '@notional-finance/contracts';
import VaultAccount from '../../VaultAccount';
import BalancerStableMath from './BalancerStableMath';
import {
  BaseBalancerStablePool,
  BaseBalancerStablePoolInitParams,
  PoolContext,
} from './BaseBalancerStablePool';
import FixedPoint from './FixedPoint';
import { doBinarySearch } from '../../Approximation';
import { System } from '../../../system';

interface InitParams extends BaseBalancerStablePoolInitParams {
  poolContext: PoolContext;
  scalingFactors: FixedPoint[];
  amplificationParameter: FixedPoint;
  totalSupply: FixedPoint;
  swapFeePercentage: FixedPoint;
  oraclePairPrice: FixedPoint;
  bptPrice: FixedPoint;
  bptPairPrice: FixedPoint;
}

export default class MetaStable2TokenAura extends BaseBalancerStablePool<InitParams> {
  public get oraclePrice() {
    const wstETHTokenIndex = 1 - this.initParams.poolContext.primaryTokenIndex;
    // Multiply by the scaling factor to get stETH terms...
    const scalingFactor = this.initParams.scalingFactors[wstETHTokenIndex];

    // NOTE: this oracle price is in wstETH terms and we have to invert it here
    const wstETHToETH = FixedPoint.ONE.mul(FixedPoint.ONE).div(
      this.initParams.oraclePairPrice
    );

    // Returns stETH to ETH
    return wstETHToETH.mul(FixedPoint.ONE).div(scalingFactor);
  }

  public get balancerPairPrice() {
    if (this.initParams.poolContext.primaryTokenIndex === 0) {
      return this.initParams.bptPairPrice;
    }

    // Invert the bpt pair price
    return FixedPoint.ONE.mul(FixedPoint.ONE).div(this.initParams.bptPairPrice);
  }

  public get balances() {
    return this.initParams.poolContext.balances.map((b, i) =>
      b.mul(this.initParams.scalingFactors[i]).div(FixedPoint.ONE)
    );
  }

  public initVaultParams() {
    const vaultContract = new Contract(
      this.vaultAddress,
      MetaStable2TokenAuraVaultABI
    ) as MetaStable2TokenAuraVault;
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
          totalBPTHeld: FixedPoint.from(r.baseStrategy.vaultState.totalBPTHeld),
        }),
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'TRADING_MODULE',
        args: [],
        key: 'tradingModule',
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
            primaryToken: r.poolContext.primaryToken,
            secondaryToken: r.poolContext.secondaryToken,
            tokenOutIndex: r.poolContext.secondaryIndex,
            balances,
            totalStrategyTokensGlobal: FixedPoint.from(
              r.baseStrategy.vaultState.totalStrategyTokenGlobal
            ),
            totalBPTHeld: FixedPoint.from(
              r.baseStrategy.vaultState.totalBPTHeld
            ),
          };
        },
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
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
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
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
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
        method: 'totalSupply',
        key: 'totalSupply',
        transform: (
          r: Awaited<ReturnType<BalancerStablePool['functions']['totalSupply']>>
        ) => FixedPoint.from(r),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
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
        target: (r) => new Contract(r['tradingModule'], TradingModuleABI),
        key: 'oraclePairPrice',
        method: 'getOraclePrice',
        args: (r) => [
          r['poolContext'].primaryToken,
          r['poolContext'].secondaryToken,
        ],
        transform: (
          r: Awaited<ReturnType<TradingModule['functions']['getOraclePrice']>>
        ) => FixedPoint.from(r.answer),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
        key: 'bptPrice',
        method: 'getTimeWeightedAverage',
        args: [
          [
            {
              variable: 1, // BPT Price
              secs: 3600,
              ago: 0,
            },
          ],
        ],
        transform: (
          r: Awaited<
            ReturnType<
              BalancerStablePool['functions']['getTimeWeightedAverage']
            >
          >
        ) => FixedPoint.from(r[0]),
      },
      {
        stage: 1,
        target: (r) =>
          new Contract(r['poolContext'].poolAddress, BalancerStablePoolABI),
        key: 'bptPairPrice',
        method: 'getTimeWeightedAverage',
        args: [
          [
            {
              variable: 0, // BPT Pair Price
              secs: 3600,
              ago: 0,
            },
          ],
        ],
        transform: (
          r: Awaited<
            ReturnType<
              BalancerStablePool['functions']['getTimeWeightedAverage']
            >
          >
        ) => FixedPoint.from(r[0]),
      },
    ] as AggregateCall[];
  }

  public getPriceExposure(_vaultAccount?: VaultAccount) {
    // const { strategyTokens } = vaultAccount.getPoolShare();
    // const bptClaim = this.convertStrategyTokensToBPT(strategyTokens);
    // const priceExposure: PriceExposure = {
    //   secondaryCurrencySymbol: 'stETH',
    //   primaryCurrencySymbol: 'ETH',
    //   levels: [],
    // };
    const percentTraded = [...Array(80).keys()];
    const { tokenOutIndex, primaryTokenIndex, balances } =
      this.initParams.poolContext;
    const { totalSupply, amplificationParameter, scalingFactors } =
      this.initParams;

    const levels = percentTraded
      .map((t) => {
        const secondaryTokensSold = this.balances[tokenOutIndex]
          .mul(FixedPoint.from(t))
          .div(FixedPoint.from(100));

        const newBalances = BalancerStableMath.getSimulatedBalancesAfterTrade(
          amplificationParameter,
          balances,
          scalingFactors,
          tokenOutIndex,
          primaryTokenIndex,
          secondaryTokensSold
        );

        const { secondaryTokenPrice, oneBPTValueSpotInPrimary } =
          BalancerStableMath.getSpotPriceInPrimary(
            amplificationParameter,
            newBalances,
            totalSupply,
            primaryTokenIndex,
            tokenOutIndex
          );

        const priceLevel = TypedBigNumber.fromBalance(
          secondaryTokenPrice.div(FixedPoint.from(1e10)).n,
          this.getPrimaryBorrowSymbol(),
          true
        ).toETH(false);

        const lpTokenValue = TypedBigNumber.fromBalance(
          oneBPTValueSpotInPrimary.div(FixedPoint.from(1e10)).n,
          this.getPrimaryBorrowSymbol(),
          true
        ).toETH(false);

        const priceLevelIndex = priceLevel.toFloat().toPrecision(2);

        return { t, priceLevel, priceLevelIndex, lpTokenValue };
      })
      .filter(
        // Filter out duplicate indexes at the specified level of precision
        ({ priceLevelIndex }, i, arr) =>
          i === 0 || arr[i - 1].priceLevelIndex !== priceLevelIndex
      );

    return levels;
  }

  public getLiquidationThresholds(
    vaultAccount: VaultAccount
  ): Array<LiquidationThreshold> {
    const { perStrategyTokenValue } =
      this.getLiquidationVaultShareValue(vaultAccount);
    if (!perStrategyTokenValue) return [] as LiquidationThreshold[];
    const thresholdBPTValue = FixedPoint.from(perStrategyTokenValue.n);

    // TODO: also adapt this for Boosted Three Token

    // If you sell x% of the secondary tokens in the pool, what will the price be of the
    // Finds how much the pool needs to move away from the primary token in order to hit
    // the liquidation strategy token value.
    const findLiquidationUtilization = (secondaryPercentSold: number) => {
      const { primaryTokenIndex, tokenOutIndex } = this.initParams.poolContext;
      // The multiple in this case is the percentage of the secondary token pool that should be
      // sold to the pool in RATE_PRECISION
      const secondaryTokensSold = this.balances[tokenOutIndex]
        .mul(FixedPoint.from(secondaryPercentSold))
        .div(FixedPoint.from(RATE_PRECISION));

      /*** MOVE THIS TO BalancerStableMath.getSimulatedBalancesAfterTrade */
      const initialInvariant = BalancerStableMath.calculateInvariant(
        this.initParams.amplificationParameter,
        this.balances,
        true
      );

      // Calculate the amount of primary tokens leaving the pool after selling
      // the given amount of secondary tokens
      const primaryTokenOut = BalancerStableMath.calcOutGivenIn(
        this.initParams.amplificationParameter,
        this.balances,
        tokenOutIndex, // selling secondary
        primaryTokenIndex, // purchasing primary
        secondaryTokensSold,
        initialInvariant
      );

      // Update balances to account for the trade
      const newBalances = this.initParams.poolContext.balances.map((b, i) => {
        const scalingFactor = this.initParams.scalingFactors[i];
        let newB: FixedPoint;
        if (i === tokenOutIndex) newB = b.add(secondaryTokensSold);
        else if (i === primaryTokenIndex) newB = b.sub(primaryTokenOut);
        // Any other balances will remain unchanged
        else newB = b;

        // Apply the scaling factor after the balance adjustment
        return newB.mul(scalingFactor).div(FixedPoint.ONE);
      });
      /*** MOVE THIS TO BalancerStableMath.getSimulatedBalancesAfterTrade */

      /*** MOVE THIS TO BalancerStableMath.getSpotPriceInPrimary */
      // Re-calculate the invariant at the new utilization
      const newInvariant = BalancerStableMath.calculateInvariant(
        this.initParams.amplificationParameter,
        newBalances,
        true
      );

      let targetSecondaryPrice = FixedPoint.from(0);
      const oneBPTValueSpotInPrimary = newBalances
        // Returns the claims of one BPT on constituent tokens
        .map((b) => b.mul(FixedPoint.ONE).div(this.initParams.totalSupply))
        .reduce((totalValue, b, i) => {
          if (i === primaryTokenIndex) return totalValue.add(b);

          // Calculate how much primary token you get for one unit of
          // secondary token to get the current spot price
          const primaryTokenSpotPrice = BalancerStableMath.calcOutGivenIn(
            this.initParams.amplificationParameter,
            newBalances,
            i, // selling the current token index
            primaryTokenIndex, // purchasing primary token
            b, // selling all of the secondary token claim
            newInvariant
          );

          if (i === tokenOutIndex)
            targetSecondaryPrice = primaryTokenSpotPrice
              .mul(FixedPoint.ONE)
              .div(b);
          return totalValue.add(primaryTokenSpotPrice);
        }, FixedPoint.from(0));
      /*** MOVE THIS TO BalancerStableMath.getSpotPriceInPrimary */

      // For price risk, we want to simulate trading until we hit some targetSecondaryPrice,
      // and then return the totalSecondary in the pool, so the delta here will simply
      // be the difference between targetSecondaryPrice (above) and secondaryPriceDesired
      // (probably rename some variables) and then the value returned is the result of
      // new balances where i == tokenOutIndex

      // Get the percentage difference in price in RATE_PRECISION
      const delta = oneBPTValueSpotInPrimary
        .div(FixedPoint.from(1e10))
        .sub(thresholdBPTValue)
        .mul(FixedPoint.from(RATE_PRECISION))
        .div(thresholdBPTValue)
        .n.toNumber();

      return {
        actualMultiple: delta,
        breakLoop: false,
        value: targetSecondaryPrice,
      };
    };

    const bptValueInInternal = this.getBPTValue(FixedPoint.ONE).div(
      FixedPoint.from(1e10)
    );
    const initialGuess = bptValueInInternal
      .sub(thresholdBPTValue)
      .mul(FixedPoint.from(RATE_PRECISION))
      .div(bptValueInInternal)
      .n.toNumber();

    // This is the price of the secondary token in terms of the primary token at the
    // thresholdBPTValue
    // prettier-ignore
    const targetSecondaryPrice = doBinarySearch(
      initialGuess, // this is the percentage difference from the threshold value
      0, // no target value since the calculation function just returns a delta
      findLiquidationUtilization,
      50 * BASIS_POINT,
      // Change the adjustment faster since trading is quite sensitive
      (m, d) => Math.floor(m - d * 0.75),
      50
    );

    // The target secondary price is quoted in terms of the primary borrow currency
    const ethExchangeRate = TypedBigNumber.fromBalance(
      targetSecondaryPrice.div(FixedPoint.from(1e10)).n,
      this.getPrimaryBorrowSymbol(),
      true
    ).toETH(false);

    const currentPrice = TypedBigNumber.fromBalance(
      this.oraclePrice.div(FixedPoint.from(1e10)).n,
      this.getPrimaryBorrowSymbol(),
      true
    ).toETH(false);

    return [
      {
        name: 'stETH/ETH Liquidation Price',
        debtCurrencySymbol: this.getPrimaryBorrowSymbol(),
        collateralCurrencySymbol: 'stETH',
        source: 'Chainlink Oracle',
        currentPrice,
        type: LiquidationThresholdType.exchangeRate,
        ethExchangeRate,
      },
    ];
  }

  protected getBPTValue(
    amountIn: FixedPoint,
    useBalancerOracle = true
  ): FixedPoint {
    const { primaryTokenIndex } = this.initParams.poolContext;
    if (useBalancerOracle) {
      // Apply this to scaled balances since the balancer pairPrice is in stETH
      return (
        this.balances
          // Returns the claims of one BPT on constituent tokens
          .map((b, i) => {
            const claim = b.mul(amountIn).div(this.initParams.totalSupply);
            if (i === primaryTokenIndex) return claim;
            else return claim.mul(FixedPoint.ONE).div(this.balancerPairPrice);
          })
          .reduce((s, b) => {
            return s.add(b);
          }, FixedPoint.from(0))
      );
    } else {
      return (
        // Apply this to the unscaled balances since the oracle is the wstETH price
        // not the stETH price
        this.initParams.poolContext.balances
          // Returns the claims of one BPT on constituent tokens
          .map((b, i) => {
            const claim = b.mul(amountIn).div(this.initParams.totalSupply);
            if (i === primaryTokenIndex) return claim;
            else return claim.mul(FixedPoint.ONE).div(this.oraclePrice);
          })
          .reduce((s, b) => {
            return s.add(b);
          }, FixedPoint.from(0))
      );
    }
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

    const dueProtocolFeeAmounts = BalancerStableMath.getDueProtocolFeeAmounts(
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

    const { amountOut } = BalancerStableMath.calcTokenOutGivenExactBptIn(
      amplificationParameter,
      balances,
      poolContext.primaryTokenIndex,
      BPTIn,
      totalSupply,
      swapFeePercentage,
      invariant
    );

    return TypedBigNumber.fromBalance(
      amountOut
        .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
        .div(FixedPoint.ONE).n,
      this.getPrimaryBorrowSymbol(),
      true
    );
  }

  private static dynamicTradeTuple =
    'tuple(uint16 dexId, uint8 tradeType, uint32 oracleSlippagePercent, bool tradeUnwrapped, bytes exchangeData) t';

  public async getRedeemParametersExact(
    _maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number
  ) {
    const bptClaim = this.convertStrategyTokensToBPT(strategyTokens);
    const { totalSupply } = this.initParams;
    const primaryBalanceOut = this.initParams.poolContext.balances[
      this.initParams.poolContext.primaryTokenIndex
    ]
      .mul(bptClaim)
      .div(totalSupply);
    const secondaryBalanceOut = this.initParams.poolContext.balances[
      this.initParams.poolContext.tokenOutIndex
    ]
      .mul(bptClaim)
      .div(totalSupply);

    const { network } = System.getSystem();
    let secondaryTradeParams: string;
    if (network === 'goerli') {
      secondaryTradeParams = utils.defaultAbiCoder.encode(
        [MetaStable2TokenAura.dynamicTradeTuple],
        [
          {
            dexId: DexId.UNISWAP_V3,
            tradeType: DexTradeType.EXACT_IN_SINGLE,
            oracleSlippagePercent: 0.01e8,
            tradeUnwrapped: false,
            exchangeData: utils.defaultAbiCoder.encode(['uint24'], [3000]),
          },
        ]
      );
    } else {
      secondaryTradeParams = utils.defaultAbiCoder.encode(
        [MetaStable2TokenAura.dynamicTradeTuple],
        [
          {
            dexId: DexId.CURVE,
            tradeType: DexTradeType.EXACT_IN_SINGLE,
            oracleSlippagePercent: 0.0025e8,
            tradeUnwrapped: true,
            exchangeData: '0x',
          },
        ]
      );
    }

    return {
      minPrimary: primaryBalanceOut
        .mul(FixedPoint.from(RATE_PRECISION - slippageBuffer))
        .div(FixedPoint.from(RATE_PRECISION)).n,
      minSecondary: secondaryBalanceOut
        .mul(FixedPoint.from(RATE_PRECISION - slippageBuffer))
        .div(FixedPoint.from(RATE_PRECISION)).n,
      secondaryTradeParams,
    };
  }
}
