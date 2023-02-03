import { BigNumber, constants } from 'ethers';
import {
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '../../config/constants';
import TypedBigNumber, { BigNumberType } from '../../libs/TypedBigNumber';
import { doBinarySearch } from '../Approximation';
import { AbstractLiquidityPool } from './AbstractLiquidityPool';

export abstract class BaseLiquidityPool<P> extends AbstractLiquidityPool {
  public readonly ORACLE_RATE_PRECISION = constants.WeiPerEther;

  constructor(
    protected totalLPTokensHeld: BigNumber,
    protected totalStrategyTokensGlobal: BigNumber,
    protected tokenDecimals: BigNumber[],
    protected balances: BigNumber[],
    protected totalSupply: BigNumber,
    protected poolParams: P
  ) {
    super();
  }

  protected zeroTokenArray() {
    return Array(this.balances.length).fill(BigNumber.from(0));
  }

  /**
   * Converts a number of LP tokens into strategy tokens
   * @param lpTokens
   * @param vaultSymbol
   * @returns strategy tokens as TypedBigNumber
   */
  protected convertLPTokensToStrategyTokens(
    lpTokens: BigNumber,
    vaultSymbol: string
  ): TypedBigNumber {
    const strategyTokens = this.totalLPTokensHeld.isZero()
      ? lpTokens.mul(INTERNAL_TOKEN_PRECISION).div(this.LP_TOKEN_PRECISION)
      : this.totalStrategyTokensGlobal
          .mul(lpTokens)
          .div(this.totalLPTokensHeld);

    return TypedBigNumber.from(
      strategyTokens,
      BigNumberType.StrategyToken,
      vaultSymbol
    );
  }

  /**
   * Converts a number of strategy tokens to LP tokens, simulating the minting
   * of additional strategy tokens if required.
   *
   * @param strategyTokens
   * @param simulatedStrategyTokens used for ad hoc analysis of post entry liquidity
   * pool dynamics
   * @returns amount of LP tokens that the strategy tokens have a claim on
   */
  protected convertStrategyTokensToLPTokens(
    strategyTokens: TypedBigNumber,
    simulatedStrategyTokens?: TypedBigNumber
  ): BigNumber {
    let totalStrategyTokens = this.totalStrategyTokensGlobal;
    let totalLPTokensHeld = this.totalLPTokensHeld;
    let accountStrategyTokens = strategyTokens;

    if (simulatedStrategyTokens) {
      // When minting additional strategy tokens we need to simulate the entry
      totalStrategyTokens = totalStrategyTokens.add(simulatedStrategyTokens.n);
      totalLPTokensHeld = totalLPTokensHeld.add(
        simulatedStrategyTokens.n
          .mul(this.LP_TOKEN_PRECISION)
          .div(INTERNAL_TOKEN_PRECISION)
      );
      accountStrategyTokens = accountStrategyTokens.add(
        simulatedStrategyTokens
      );
    }

    const accountLPTokens = accountStrategyTokens.n
      .mul(this.LP_TOKEN_PRECISION)
      .div(INTERNAL_TOKEN_PRECISION);

    return totalStrategyTokens.isZero()
      ? accountLPTokens
      : totalLPTokensHeld.mul(accountStrategyTokens.n).div(totalStrategyTokens);
  }

  /**
   * Returns the value of tokens given the oracle price in the primary token index
   * @param balances balances in each constituent token
   * @param oracleExchangeRates oracle exchange rates for all the tokens to the primary (always
   * in 18 decimal precision)
   * @param primaryTokenIndex index of the primary token
   */
  protected getValueInPrimary(
    balances: BigNumber[],
    oraclePrices: BigNumber[],
    primaryTokenIndex: number
  ): BigNumber {
    return (
      balances
        .map((b, i) =>
          i === primaryTokenIndex
            ? b
            : // Convert balance to primary in primary decimals
              b
                .mul(oraclePrices[i])
                .mul(this.tokenDecimals[primaryTokenIndex])
                .div(this.ORACLE_RATE_PRECISION)
                .div(this.tokenDecimals[i])
        )
        // Sum all balances in primary valuation
        .reduce((v, i) => v.add(i), BigNumber.from(0))
    );
  }

  /**
   * Returns the value of lp tokens given the oracle price in the primary token index
   * @param lpTokens number of lp tokens held
   * @param oracleExchangeRates oracle exchange rates for all the tokens to the primary (always
   * in 18 decimal precision)
   * @param primaryTokenIndex index of the primary token
   */
  protected getLPTokenOracleValue(
    lpTokens: BigNumber,
    oraclePrices: BigNumber[],
    primaryTokenIndex: number
  ): BigNumber {
    const tokensOut = this.getLPTokenClaims(lpTokens);
    return this.getValueInPrimary(tokensOut, oraclePrices, primaryTokenIndex);
  }

  /**
   * Returns the valuation of a single LP token as the result of a single sided
   * exit to the primary token index
   * @param primaryTokenIndex
   * @returns valuation of the lp token in the primary token
   */
  protected getLPTokenSpotValue(primaryTokenIndex: number): BigNumber {
    return this.getBalanceArraySpotValue(
      this.getLPTokenClaims(this.LP_TOKEN_PRECISION),
      primaryTokenIndex
    );
  }

  /**
   * Returns the valuation in the primary token of an array of balances all traded to
   * the primary token index
   * @param balances
   * @param primaryTokenIndex
   *
   * @returns value of all the balances traded to the primary on this LP pool
   */
  protected getBalanceArraySpotValue(
    balances: BigNumber[],
    primaryTokenIndex: number
  ): BigNumber {
    return balances
      .map((b, i) => {
        if (i === primaryTokenIndex) return b;
        const { tokensOut } = this.calculateTokenTrade(b, primaryTokenIndex, i);
        return tokensOut;
      })
      .reduce((t, v) => t.add(v), BigNumber.from(0));
  }

  /**
   * Returns proportional claims on LP tokens
   *
   * @param lpTokens
   * @returns array of token claims the amount of lp tokens has
   */
  protected getLPTokenClaims(lpTokens: BigNumber): BigNumber[] {
    return this.balances.map((b) => lpTokens.mul(b).div(this.totalSupply));
  }

  /**
   * Returns the amount of tokens required to mint a given amount of lp tokens. Does
   * a binary search estimation for single sided entry using `getLPTokensGivenTokens`
   * if singleSidedEntryTokenIndex is specified.
   *
   * @param lpTokensRequired
   * @param singleSidedEntryTokenIndex
   */
  protected getTokensRequiredForLPTokens(
    lpTokensRequired: BigNumber,
    singleSidedEntryTokenIndex?: number
  ): {
    tokensIn: BigNumber[];
    feesPaid: BigNumber[];
  } {
    // Balancer has an odd fee calculation method on single sided joins so this is
    // not the equivalent of join + swap
    if (singleSidedEntryTokenIndex) {
      const amountIn = this.getLPTokenSpotValue(singleSidedEntryTokenIndex);
      const lpToAmountInEstimate = amountIn
        .mul(RATE_PRECISION)
        .div(this.LP_TOKEN_PRECISION)
        .toNumber();

      const calculationFunction = (lpToPrimaryRatio: number) => {
        const tokensIn = Array(this.balances.length).fill(BigNumber.from(0));
        const primaryTokensIn = lpTokensRequired
          .mul(lpToPrimaryRatio)
          .div(RATE_PRECISION);

        tokensIn[singleSidedEntryTokenIndex] = primaryTokensIn;
        const { lpTokens, feesPaid } = this.getLPTokensGivenTokens(tokensIn);

        const actualMultiple = lpTokens
          .mul(RATE_PRECISION)
          .div(lpTokensRequired)
          .toNumber();

        return {
          actualMultiple,
          breakLoop: false,
          value: { tokensIn, feesPaid },
        };
      };

      return doBinarySearch(
        lpToAmountInEstimate,
        RATE_PRECISION,
        calculationFunction
      );
    } else {
      return {
        // Balanced entry is equal to the token claims post entry
        tokensIn: this.getLPTokenClaims(lpTokensRequired),
        // No fees paid on equal sided entry
        feesPaid: this.zeroTokenArray(),
      };
    }
  }

  protected getLPTokensRequiredForTokens(tokensOut: BigNumber[]): {
    lpTokens: BigNumber;
    feesPaid: BigNumber[];
  } {
    const nonZeroIndexes = tokensOut.reduce(
      (l, t, i) => (t.isZero() ? l : [...l, i]),
      [] as number[]
    );
    const singleSidedExitTokenIndex =
      nonZeroIndexes.length === 1 ? nonZeroIndexes[0] : undefined;

    if (singleSidedExitTokenIndex) {
      // In a single sided exit, do a binary search for the amount of LP tokens required
      // to exit the pool
      const amountOutRequired = tokensOut[singleSidedExitTokenIndex];
      const lpToAmountOutEstimate = amountOutRequired
        .mul(RATE_PRECISION)
        .div(this.getLPTokenSpotValue(singleSidedExitTokenIndex))
        .toNumber();

      const calculationFunction = (lpToAmountRatio: number) => {
        const lpTokens = amountOutRequired
          .mul(lpToAmountRatio)
          .div(RATE_PRECISION);
        // Passing in single sided exit token index forces the exit to be in
        // the given token index
        const { tokensOut, feesPaid } = this.getTokensOutGivenLPTokens(
          lpTokens,
          singleSidedExitTokenIndex
        );

        const actualMultiple = tokensOut[singleSidedExitTokenIndex]
          .mul(RATE_PRECISION)
          .div(amountOutRequired)
          .toNumber();

        return {
          actualMultiple,
          breakLoop: false,
          value: { lpTokens, feesPaid },
        };
      };

      return doBinarySearch(
        lpToAmountOutEstimate,
        RATE_PRECISION,
        calculationFunction
      );
    } else {
      // In a multi-sided exit, use the total value in primary of tokens to exit as a
      // starting point for an estimate
      const [_, largestTokenIndex] = nonZeroIndexes.reduce(
        ([prevValue, prevIndex], i) =>
          (prevValue.lt(tokensOut[i])
            ? [tokensOut[i], i]
            : [prevValue, prevIndex]) as [BigNumber, number],
        [BigNumber.from(0), -1] as [BigNumber, number]
      );

      const totalValueOutRequired = this.getBalanceArraySpotValue(
        tokensOut,
        largestTokenIndex
      );

      const lpToTotalOutEstimate = totalValueOutRequired
        .mul(RATE_PRECISION)
        .div(this.getLPTokenSpotValue(largestTokenIndex))
        .toNumber();

      const calculationFunction = (lpToAmountRatio: number) => {
        const lpTokens = totalValueOutRequired
          .mul(lpToAmountRatio)
          .div(RATE_PRECISION);

        const { tokensOut: tokensOutTemp, feesPaid: _feesPaid } =
          this.getTokensOutGivenLPTokens(lpTokens);
        let feesPaid = _feesPaid;

        const diffFromTarget = tokensOutTemp.map((o, i, diffs) => {
          let tokenDiff = o.sub(tokensOut[i]);
          while (tokenDiff.isNegative()) {
            // Find the first positive index in the array
            const positiveIndex = diffs.findIndex(
              (_) => !_.isNegative() && !_.isZero()
            );

            // Unable to trade the position away, need to withdraw more
            // liquidity tokens
            if (positiveIndex === -1) return tokenDiff;

            // Trade the the balance to recover the negative amount
            const { tokensOut: tokensTraded, feesPaid: feesFromTrade } =
              this.calculateTokenTrade(diffs[positiveIndex], positiveIndex, i);
            tokenDiff = tokenDiff.add(tokensTraded);

            // Modifies the token diff array in place
            diffs[positiveIndex] = BigNumber.from(0);

            // Aggregate all fees traded
            feesPaid = feesPaid.map((f, i) => f.add(feesFromTrade[i]));
          }

          return tokenDiff;
        });

        let valueOfTokensOut = this.getBalanceArraySpotValue(
          tokensOut,
          largestTokenIndex
        );

        if (diffFromTarget.find((_) => _.isNegative())) {
          // If the diff from target has negative values, then we have undershot
          // the required amount. There should be no positive values if there are
          // negative values. Calculate an adjustment to the valuation here.
          const undershotAdjustment = this.getBalanceArraySpotValue(
            diffFromTarget.map((_) => _.mul(-1)),
            largestTokenIndex
          );
          valueOfTokensOut = valueOfTokensOut.add(undershotAdjustment);
        }

        const actualMultiple = valueOfTokensOut
          .mul(RATE_PRECISION)
          .div(totalValueOutRequired)
          .toNumber();

        return {
          actualMultiple,
          breakLoop: false,
          value: { lpTokens, feesPaid },
        };
      };

      return doBinarySearch(
        lpToTotalOutEstimate,
        RATE_PRECISION,
        calculationFunction
      );
    }
  }
}
