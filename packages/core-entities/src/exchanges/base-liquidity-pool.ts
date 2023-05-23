import { AbstractLiquidityPool } from './abstract-liquidity-pool';
import { ExchangeRate, TokenBalance } from '..';
import {
  Network,
  RATE_DECIMALS,
  RATE_PRECISION,
  doBinarySearch,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';

export default abstract class BaseLiquidityPool<
  P
> extends AbstractLiquidityPool {
  // Balances and total supply are marked as protected so ComposableStablePool can work properly
  constructor(
    protected _network: Network,
    protected _balances: TokenBalance[],
    protected _totalSupply: TokenBalance,
    public poolParams: P
  ) {
    super();
  }

  public get balances() {
    return this._balances;
  }

  public get totalSupply() {
    return this._totalSupply;
  }

  public zeroTokenArray() {
    return this.balances.map((b) => b.copy(0));
  }

  public oneLPToken() {
    return this.totalSupply.copy(this.totalSupply.precision);
  }

  public totalValueLocked(primaryTokenIndex: number) {
    return this.getBalanceArrayOracleValue(this.balances, primaryTokenIndex);
  }

  /**
   * Returns the value of tokens given the oracle price in the primary token index
   * @param balances balances in each constituent token
   * @param oracleExchangeRates oracle exchange rates for all the tokens to the primary (always
   * in 18 decimal precision)
   * @param primaryTokenIndex index of the primary token
   */
  public getBalanceArrayOracleValue(
    balances: TokenBalance[],
    primaryTokenIndex: number,
    oraclePrices?: ExchangeRate[]
  ): TokenBalance {
    const primaryToken = balances[primaryTokenIndex].token;
    return (
      balances
        .map((b, i) =>
          i === primaryTokenIndex
            ? b
            : b.toToken(
                primaryToken,
                'None', // No Risk adjustment here
                oraclePrices ? oraclePrices[i] : undefined
              )
        )
        // Sum all balances in primary valuation
        .reduce((v, i) => v.add(i), TokenBalance.zero(primaryToken))
    );
  }

  /**
   * Returns the value of lp tokens given the oracle price in the primary token index
   * @param lpTokens number of lp tokens held
   * @param oracleExchangeRates oracle exchange rates for all the tokens to the primary (always
   * in 18 decimal precision)
   * @param primaryTokenIndex index of the primary token
   */
  public getLPTokenOracleValue(
    lpTokens: TokenBalance,
    primaryTokenIndex: number,
    oraclePrices?: ExchangeRate[]
  ): TokenBalance {
    const tokensOut = this.getLPTokenClaims(lpTokens);
    return this.getBalanceArrayOracleValue(
      tokensOut,
      primaryTokenIndex,
      oraclePrices
    );
  }

  /**
   * Returns the valuation of a single LP token as the result of a single sided
   * exit to the primary token index
   * @param primaryTokenIndex
   * @returns valuation of the lp token in the primary token
   */
  public getLPTokenSpotValue(
    primaryTokenIndex: number,
    balancesOverride?: TokenBalance[]
  ): TokenBalance {
    return this.getBalanceArraySpotValue(
      this.getLPTokenClaims(this.oneLPToken(), balancesOverride),
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
  public getBalanceArraySpotValue(
    balances: TokenBalance[],
    primaryTokenIndex: number,
    balanceOverrides?: TokenBalance[]
  ): TokenBalance {
    return balances
      .map((b, i) => {
        if (i === primaryTokenIndex) return b;
        const { tokensOut } = this.calculateTokenTrade(
          b,
          i,
          primaryTokenIndex,
          balanceOverrides
        );
        return tokensOut;
      })
      .reduce((t, v) => t.add(v), this.balances[primaryTokenIndex].copy(0));
  }

  /**
   * Returns proportional claims on LP tokens
   *
   * @param lpTokens
   * @returns array of token claims the amount of lp tokens has
   */
  public getLPTokenClaims(
    lpTokens: TokenBalance,
    balancesOverride?: TokenBalance[],
    totalSupplyOverride?: TokenBalance
  ): TokenBalance[] {
    return (balancesOverride || this.balances).map((b) =>
      b.scale(lpTokens, totalSupplyOverride || this.totalSupply)
    );
  }

  /**
   * Returns the amount of tokens required to mint a given amount of lp tokens. Does
   * a binary search estimation for single sided entry using `getLPTokensGivenTokens`
   * if singleSidedEntryTokenIndex is specified.
   *
   * @param lpTokensRequired
   * @param singleSidedEntryTokenIndex
   */
  public getTokensRequiredForLPTokens(
    lpTokensRequired: TokenBalance,
    singleSidedEntryTokenIndex?: number
  ): {
    tokensIn: TokenBalance[];
    feesPaid: TokenBalance[];
  } {
    // Balancer has an odd fee calculation method on single sided joins so this is
    // not the equivalent of join + swap
    if (singleSidedEntryTokenIndex !== undefined) {
      const amountIn = this.getLPTokenOracleValue(
        this.oneLPToken(),
        singleSidedEntryTokenIndex
      );
      const lpToAmountInEstimate = amountIn
        .divInRatePrecision(this.oneLPToken().precision)
        .toNumber();

      const calculationFunction = (lpToPrimaryRatio: number) => {
        const tokensIn = this.zeroTokenArray();
        const primaryTokensIn =
          lpTokensRequired.mulInRatePrecision(lpToPrimaryRatio).n;
        tokensIn[singleSidedEntryTokenIndex] =
          tokensIn[singleSidedEntryTokenIndex].copy(primaryTokensIn);

        const { lpTokens, feesPaid } = this.getLPTokensGivenTokens(tokensIn);

        return {
          actualMultiple: lpTokens.ratioWith(lpTokensRequired).toNumber(),
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

  public getLPTokensRequiredForTokens(tokensOut: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    const nonZeroIndexes = tokensOut.reduce(
      (l, t, i) => (t.isZero() ? l : [...l, i]),
      [] as number[]
    );
    const singleSidedExitTokenIndex =
      nonZeroIndexes.length === 1 ? nonZeroIndexes[0] : undefined;

    if (singleSidedExitTokenIndex !== undefined) {
      // In a single sided exit, do a binary search for the amount of LP tokens required
      // to exit the pool
      const amountOutRequired = tokensOut[singleSidedExitTokenIndex];
      const lpToAmountOutEstimate = amountOutRequired
        .ratioWith(this.getLPTokenSpotValue(singleSidedExitTokenIndex))
        .toNumber();

      const calculationFunction = (lpToAmountRatio: number) => {
        const lpTokens = this.oneLPToken().copy(
          amountOutRequired.mulInRatePrecision(lpToAmountRatio).n
        );

        // Passing in single sided exit token index forces the exit to be in
        // the given token index
        const { tokensOut, feesPaid } = this.getTokensOutGivenLPTokens(
          lpTokens,
          singleSidedExitTokenIndex
        );

        return {
          actualMultiple: tokensOut[singleSidedExitTokenIndex]
            .ratioWith(amountOutRequired)
            .toNumber(),
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
          prevValue < tokensOut[i].toFloat()
            ? [tokensOut[i].toFloat(), i]
            : [prevValue, prevIndex],
        [0, -1]
      );

      // Value of all the tokens taken out of the pool
      const totalValueOutRequired = this.getBalanceArrayOracleValue(
        tokensOut,
        largestTokenIndex
      );

      // Get the ratio of the value taken out to the value of a single LP token, this
      // dictates the starting estimate for how many LP tokens need to be withdrawn
      const initialLPEstimate = this.oneLPToken().scale(
        totalValueOutRequired.scaleTo(this.totalSupply.decimals),
        this.getLPTokenOracleValue(this.oneLPToken(), largestTokenIndex)
      );

      /** Start Calculation Function **/
      const calculationFunction = (lpTokensInRatePrecision: number) => {
        // LP to Amount Ratio = totalValueOutRequired / oneLPTokenOracleValue
        const lpTokens = this.oneLPToken().copy(
          BigNumber.from(lpTokensInRatePrecision)
            .mul(this.totalSupply.precision)
            .div(RATE_PRECISION)
        );

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
            diffs[positiveIndex] = diffs[positiveIndex].copy(0);

            // Aggregate all fees traded
            feesPaid = feesPaid.map((f, i) => f.add(feesFromTrade[i]));
          }

          return tokenDiff;
        });

        let valueOfTokensOut = this.getBalanceArrayOracleValue(
          tokensOut,
          largestTokenIndex
        );

        if (diffFromTarget.find((_) => _.isNegative())) {
          // If the diff from target has negative values, then we have undershot
          // the required amount. There should be no positive values if there are
          // negative values. Calculate an adjustment to the valuation here.
          const undershotAdjustment = this.getBalanceArrayOracleValue(
            diffFromTarget.map((_) => _.neg()),
            largestTokenIndex
          );
          valueOfTokensOut = valueOfTokensOut.add(undershotAdjustment);
        }

        return {
          actualMultiple: valueOfTokensOut
            .ratioWith(totalValueOutRequired)
            .toNumber(),
          breakLoop: false,
          value: { lpTokens, feesPaid },
        };
      };
      /** End Calculation Function **/

      return doBinarySearch(
        initialLPEstimate.scaleTo(RATE_DECIMALS).toNumber(),
        RATE_PRECISION,
        calculationFunction
      );
    }
  }

  public getPriceExposureTable(
    tokenIndexIn: number,
    tokenIndexOut: number,
    percentDepthTraded = 80
  ) {
    return Array(percentDepthTraded)
      .map((_, i) => {
        // Percentage of the sold token index
        const tokensIn = this.balances[tokenIndexIn].scale(i, 100);
        const { tokensOut } = this.calculateTokenTrade(
          tokensIn,
          tokenIndexIn,
          tokenIndexOut
        );

        const newBalances = Array.from(this.balances);
        newBalances[tokenIndexIn] = newBalances[tokenIndexIn].sub(tokensIn);
        newBalances[tokenIndexOut] = newBalances[tokenIndexOut].add(tokensOut);

        const lpTokenValue = this.getLPTokenSpotValue(
          tokenIndexOut,
          newBalances
        );

        const { tokensOut: secondaryTokenPrice } = this.calculateTokenTrade(
          // Calculate the trade of a single unit of the token index in
          this.balances[tokenIndexIn].copy(
            this.balances[tokenIndexIn].precision
          ),
          tokenIndexIn,
          tokenIndexOut,
          newBalances
        );

        const priceLevelIndex = secondaryTokenPrice.toFloat().toPrecision(2);

        return { lpTokenValue, secondaryTokenPrice, priceLevelIndex };
      })
      .filter(
        // Filter out duplicate indexes at the specified level of precision
        ({ priceLevelIndex }, i, arr) =>
          i === 0 || arr[i - 1].priceLevelIndex !== priceLevelIndex
      );
  }
}
