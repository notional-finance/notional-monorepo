import { AggregateCall } from '@notional-finance/multicall';
import {
  AssetType,
  encodeERC1155Id,
  getNowSeconds,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  NotionalAddress,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
} from '@notional-finance/util';
import {
  NotionalV3,
  NTokenERC20ABI,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import { ExchangeRate } from '../../definitions';

interface fCashMarketParams {
  perMarketCash: TokenBalance[];
  nTokenFCash: TokenBalance[];
  nTokenCash: TokenBalance;
  currencyId: number;
  interestRateCurve: InterestRateParameters[];
}

interface InterestRateParameters {
  kinkUtilization1: number;
  kinkUtilization2: number;
  kinkRate1: number;
  kinkRate2: number;
  maxRate: number;
  minFeeRate: number;
  maxFeeRate: number;
  feeRatePercent: number;
}

export class fCashMarket extends BaseLiquidityPool<fCashMarketParams> {
  /**
   * fCash markets are modeled as multiple token AMM.
   * this.balance[0] is the total cash held by the nToken
   * this.balance[1+] are the fCash balances held by the nToken.
   *
   * @param _network
   * @param _poolAddress this is the nToken address
   */
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const notional = new Contract(NotionalAddress[network], NotionalV3ABI);
    const nToken = new Contract(poolAddress, NTokenERC20ABI);

    return [
      {
        stage: 0,
        target: notional,
        method: 'getNTokenPortfolio',
        key: 'nTokenFCash',
        args: [poolAddress],
        transform: (
          r: Awaited<ReturnType<NotionalV3['functions']['getNTokenPortfolio']>>
        ) => {
          return r.netfCashAssets.map((a) => {
            const fCashId = encodeERC1155Id(
              a.currencyId,
              a.maturity.toNumber(),
              a.assetType.toNumber(),
              a.notional.isNegative()
            );
            return TokenBalance.toJSON(a.notional, fCashId, network);
          });
        },
      },
      {
        stage: 0,
        target: nToken,
        method: 'currencyId',
        key: 'currencyId',
      },
      {
        stage: 0,
        target: nToken,
        method: 'totalSupply',
        key: 'totalSupply',
        transform: (r: BigNumber) =>
          TokenBalance.toJSON(r, poolAddress, network),
      },
      {
        stage: 1,
        target: notional,
        method: 'pCashAddress',
        args: (r) => [r[`${poolAddress}.currencyId`]],
        key: 'pCashAddress',
      },
      {
        stage: 1,
        target: notional,
        method: 'getInterestRateCurve',
        key: 'interestRateCurve',
        args: (r) => [r[`${poolAddress}.currencyId`]],
        transform: (
          r: Awaited<
            ReturnType<NotionalV3['functions']['getInterestRateCurve']>
          >
        ) => {
          return r.activeInterestRateCurve.map((c) => {
            return {
              kinkUtilization1: c.kinkUtilization1.toNumber(),
              kinkUtilization2: c.kinkUtilization2.toNumber(),
              kinkRate1: c.kinkRate1.toNumber(),
              kinkRate2: c.kinkRate2.toNumber(),
              maxRate: c.maxRate.toNumber(),
              minFeeRate: c.minFeeRate.toNumber(),
              maxFeeRate: c.maxFeeRate.toNumber(),
              feeRatePercent: c.feeRatePercent.toNumber(),
            };
          });
        },
      },
      {
        stage: 2,
        target: notional,
        method: 'getNTokenAccount',
        key: 'nTokenCash',
        args: [poolAddress],
        transform: (
          r: Awaited<ReturnType<NotionalV3['functions']['getNTokenAccount']>>,
          aggregateResults: Record<string, unknown>
        ) => {
          const pCashAddress = aggregateResults[
            `${poolAddress}.pCashAddress`
          ] as string;
          return TokenBalance.toJSON(r.cashBalance, pCashAddress, network);
        },
      },
      {
        stage: 2,
        target: notional,
        method: 'getActiveMarkets',
        key: ['perMarketCash', 'balances'],
        args: (r) => [r[`${poolAddress}.currencyId`]],
        transform: (
          r: Awaited<
            ReturnType<NotionalV3['functions']['getActiveMarkets']>
          >[0],
          aggregateResults: Record<string, unknown>
        ) => {
          const pCashAddress = aggregateResults[
            `${poolAddress}.pCashAddress`
          ] as string;
          const currencyId = aggregateResults[
            `${poolAddress}.currencyId`
          ] as number;

          const perMarketCash = r.map((m) =>
            TokenBalance.toJSON(m.totalPrimeCash, pCashAddress, network)
          );

          const balances = r.map((m) => {
            const fCashId = encodeERC1155Id(
              currencyId,
              m.maturity.toNumber(),
              AssetType.FCASH_ASSET_TYPE,
              false
            );
            return TokenBalance.toJSON(m.totalfCash, fCashId, network);
          });

          return {
            [`${poolAddress}.perMarketCash`]: perMarketCash,
            [`${poolAddress}.balances`]: balances,
          };
        },
      },
    ];
  }

  constructor(
    _network: Network,
    _balances: TokenBalance[],
    _totalSupply: TokenBalance,
    poolParams: fCashMarketParams
  ) {
    // Prepend the total cash balances as the token zero for the nToken
    const totalCash = poolParams.perMarketCash
      .reduce((p, c) => p.add(c))
      .add(poolParams.nTokenCash);
    const balances = [totalCash, ..._balances];
    super(_network, balances, _totalSupply, poolParams);
  }

  /**
   * When calculating a trade in an fCash market, the user must always trade to cash as
   * the tokenIndexIn or tokenIndexOut.
   * @param tokensIn
   * @param tokenIndexIn
   * @param tokenIndexOut
   * @param balanceOverrides
   */
  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexIn: number,
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ): {
    tokensOut: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    if (tokenIndexIn == 0) {
      // Depositing cash, receiving positive fCash
      const fCashAmount = this.getfCashGivenCashAmount(
        tokenIndexOut,
        tokensIn.neg(), // Negative cash to account, receives positive fcash
        balanceOverrides
      );
      const { fee } = this.getCashGivenfCashAmount(
        tokenIndexOut,
        fCashAmount,
        balanceOverrides
      );

      const feesPaid = this.zeroTokenArray();
      feesPaid[0] = feesPaid[0].copy(fee.n);

      return { feesPaid, tokensOut: fCashAmount };
    } else if (tokenIndexOut == 0) {
      // Withdrawing cash, depositing fCash
      const { underlyingCash, fee } = this.getCashGivenfCashAmount(
        tokenIndexIn, // market index
        tokensIn.neg(),
        balanceOverrides
      );
      const feesPaid = this.zeroTokenArray();
      feesPaid[0] = feesPaid[0].copy(fee.n);

      return {
        feesPaid,
        tokensOut: underlyingCash.neg().toToken(this.balances[0].token),
      };
    } else {
      throw Error('One token index in or out must be zero');
    }
  }

  public override getBalanceArrayOracleValue(
    balances: TokenBalance[],
    primaryTokenIndex: number,
    oraclePrices?: ExchangeRate[]
  ): TokenBalance {
    // Account for the nToken's net fcash balances
    const netBalances = balances.map((b, i) => {
      return i === 0 ? b : b.add(this.poolParams.nTokenFCash[i - 1]);
    });

    return super.getBalanceArrayOracleValue(
      netBalances,
      primaryTokenIndex,
      oraclePrices
    );
  }

  /**
   * Calculates the amount of nTokens minted given a prime cash deposit
   * @param tokensIn Must always be a balance of prime cash
   * @returns nTokens minted, fees paid is always an array of zeros
   */
  public getLPTokensGivenTokens(tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    // Only tokensIn[0] can be specified
    tokensIn.forEach((v, i) => {
      if (i > 0 && !v.isZero()) throw Error('Tokens in must be prime cash');
    });
    tokensIn[0].isMatch(this.balances[0]);

    // Should use the oracle to fetch the nToken PV
    const lpTokenValue = this.getBalanceArrayOracleValue(this.balances, 0);
    const lpTokens = this.totalSupply.scale(tokensIn[0], lpTokenValue);

    return {
      // No fees paid on minting
      feesPaid: this.zeroTokenArray(),
      lpTokens,
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: TokenBalance[];
    feesPaid: TokenBalance[];
  } {
    if (singleSidedExitTokenIndex == 0) {
      // Simulate selling fCash
      const { primeCash, netfCash } = this.getProportionalHoldings(
        lpTokens,
        false
      );

      // Simulates selling netfCash positions
      const { totalFees, netUnderlyingCash } = netfCash.reduce(
        ({ totalFees, netUnderlyingCash }, fCash, i) => {
          const { fee, underlyingCash } = this.getCashGivenfCashAmount(
            i + 1,
            fCash
          );
          return {
            totalFees: totalFees.add(fee),
            netUnderlyingCash: netUnderlyingCash.add(underlyingCash),
          };
        },
        {
          totalFees: this.getZeroUnderlying(),
          netUnderlyingCash: this.getZeroUnderlying(),
        }
      );

      const tokensOut = this.zeroTokenArray();
      const feesPaid = this.zeroTokenArray();
      tokensOut[0] = primeCash.add(
        netUnderlyingCash.toToken(tokensOut[0].token)
      );
      feesPaid[0] = totalFees.toToken(feesPaid[0].token);

      return { tokensOut, feesPaid };
    } else {
      // Simulate pulling fCash proportional
      const { primeCash, netfCash } = this.getProportionalHoldings(
        lpTokens,
        true // accept ifCash
      );

      return {
        tokensOut: [primeCash].concat(netfCash),
        feesPaid: this.zeroTokenArray(),
      };
    }
  }

  public getfCashGivenCashAmount(
    marketIndex: number,
    cashAmount: TokenBalance,
    balanceOverrides?: TokenBalance[],
    nowSeconds = getNowSeconds()
  ) {
    const balances = balanceOverrides || this._balances;
    const irParams = this.getIRParams(marketIndex);
    const totalfCash = balances[marketIndex];
    const totalCashUnderlying = this.getMarketCashUnderlying(marketIndex);
    const timeToMaturity = this.getTimeToMaturity(marketIndex, nowSeconds);
    const netUnderlyingToAccount = cashAmount.toUnderlying();

    let fCash_0: TokenBalance;
    let fCash_1: TokenBalance;
    const currentfCashExchangeRate = this._calculatePostFeeExchangeRate(
      marketIndex,
      totalfCash,
      totalCashUnderlying,
      timeToMaturity,
      netUnderlyingToAccount.isPositive()
        ? totalfCash.copy(-1)
        : totalfCash.copy(1)
    );

    if (netUnderlyingToAccount.isNegative()) {
      fCash_0 = totalfCash.copy(netUnderlyingToAccount.neg().scaleTo(8));
      fCash_1 = totalfCash.copy(
        netUnderlyingToAccount
          .mulInRatePrecision(currentfCashExchangeRate)
          .neg()
          .scaleTo(INTERNAL_TOKEN_DECIMALS)
      );
    } else {
      fCash_0 = totalfCash.copy(
        netUnderlyingToAccount
          .mulInRatePrecision(currentfCashExchangeRate)
          .neg()
          .scaleTo(INTERNAL_TOKEN_DECIMALS)
      );
      fCash_1 = totalfCash.copy(
        netUnderlyingToAccount
          .mulInRatePrecision(
            this.getfCashExchangeRate(irParams.maxRate, timeToMaturity)
          )
          .neg()
          .scaleTo(INTERNAL_TOKEN_DECIMALS)
      );
    }

    let diff_0 = this._calculateDiff(
      marketIndex,
      totalfCash,
      totalCashUnderlying,
      fCash_0,
      timeToMaturity,
      netUnderlyingToAccount
    );

    for (let i = 0; i < 250; i++) {
      const fCashDelta = fCash_1.sub(fCash_0);
      if (fCashDelta.isZero()) return fCash_1;
      const diff_1 = this._calculateDiff(
        marketIndex,
        totalfCash,
        totalCashUnderlying,
        fCash_1,
        timeToMaturity,
        netUnderlyingToAccount
      );

      const fCash_n = fCash_1.sub(diff_1.scale(fCashDelta, diff_1.sub(diff_0)));
      fCash_1 = fCash_n;
      fCash_0 = fCash_1;
      diff_0 = diff_1;
    }

    throw Error('No convergence');
  }

  private _calculateDiff(
    marketIndex: number,
    totalfCash: TokenBalance,
    totalCashUnderlying: TokenBalance,
    fCashToAccount: TokenBalance,
    timeToMaturity: number,
    netUnderlyingToAccount: TokenBalance
  ) {
    const exchangeRate = this._calculatePostFeeExchangeRate(
      marketIndex,
      totalfCash,
      totalCashUnderlying,
      timeToMaturity,
      fCashToAccount
    );

    return fCashToAccount.add(
      fCashToAccount.copy(
        netUnderlyingToAccount
          .mulInRatePrecision(exchangeRate)
          .scaleTo(INTERNAL_TOKEN_DECIMALS)
      )
    );
  }

  private _calculatePostFeeExchangeRate(
    marketIndex: number,
    totalfCash: TokenBalance,
    totalCashUnderlying: TokenBalance,
    timeToMaturity: number,
    fCashToAccount: TokenBalance
  ) {
    const preFeeInterestRate = this.getInterestRate(
      marketIndex,
      this.getfCashUtilization(fCashToAccount, totalfCash, totalCashUnderlying)
    );
    const postFeeInterestRate = this.getPostFeeInterestRate(
      marketIndex,
      preFeeInterestRate,
      fCashToAccount.isNegative()
    );
    return this.getfCashExchangeRate(postFeeInterestRate, timeToMaturity);
  }

  public getCashGivenfCashAmount(
    marketIndex: number,
    fCashAmount: TokenBalance,
    balanceOverrides?: TokenBalance[],
    nowSeconds = getNowSeconds()
  ) {
    // NOTE: this only overrides the fCash balances
    const balances = balanceOverrides || this.balances;
    const totalCashUnderlying = this.getMarketCashUnderlying(marketIndex);

    const utilization = this.getfCashUtilization(
      fCashAmount,
      balances[marketIndex],
      totalCashUnderlying
    );

    const preFeeInterestRate = this.getInterestRate(marketIndex, utilization);
    const postFeeInterestRate = this.getPostFeeInterestRate(
      marketIndex,
      preFeeInterestRate,
      fCashAmount.isNegative()
    );

    const timeToMaturity = this.getTimeToMaturity(marketIndex, nowSeconds);
    const preFeeCashToAccount = totalCashUnderlying.copy(
      fCashAmount
        .divInRatePrecision(
          this.getfCashExchangeRate(preFeeInterestRate, timeToMaturity)
        )
        .scaleTo(totalCashUnderlying.decimals)
    );

    const postFeeCashToAccount = totalCashUnderlying.copy(
      fCashAmount
        .divInRatePrecision(
          this.getfCashExchangeRate(postFeeInterestRate, timeToMaturity)
        )
        .scaleTo(totalCashUnderlying.decimals)
    );

    const fee = preFeeCashToAccount.sub(postFeeCashToAccount);

    return { fee, underlyingCash: postFeeCashToAccount };
  }

  public getfCashUtilization(
    fCashToAccount: TokenBalance,
    totalfCash: TokenBalance,
    totalCashUnderlying: TokenBalance
  ) {
    return totalfCash
      .sub(fCashToAccount)
      .divInRatePrecision(totalCashUnderlying.scaleTo(8).add(totalfCash.n))
      .toNumber();
  }

  public getInterestRate(marketIndex: number, utilization: number) {
    if (utilization < 0 || RATE_PRECISION < utilization)
      throw Error('Out of utilization bounds');
    const irParams = this.getIRParams(marketIndex);
    if (utilization <= irParams.kinkUtilization1) {
      return Math.floor(
        (utilization * irParams.kinkRate1) / irParams.kinkUtilization2
      );
    } else if (utilization <= irParams.kinkUtilization2) {
      return Math.floor(
        ((utilization - irParams.kinkUtilization1) *
          (irParams.kinkRate2 - irParams.kinkRate1)) /
          (irParams.kinkUtilization2 - irParams.kinkUtilization1) +
          irParams.kinkRate1
      );
    } else {
      return Math.floor(
        ((utilization - irParams.kinkUtilization2) *
          (irParams.maxRate - irParams.kinkRate2)) /
          (RATE_PRECISION - irParams.kinkUtilization2) +
          irParams.kinkRate2
      );
    }
  }

  public getPostFeeInterestRate(
    marketIndex: number,
    preFeeInterestRate: number,
    isBorrow: boolean
  ) {
    const irParams = this.getIRParams(marketIndex);

    let feeRate = Math.floor(
      (preFeeInterestRate * irParams.feeRatePercent) / 100
    );
    if (feeRate < irParams.minFeeRate) feeRate = irParams.minFeeRate;
    if (feeRate > irParams.maxFeeRate) feeRate = irParams.maxFeeRate;

    if (isBorrow) {
      return preFeeInterestRate + feeRate;
    } else {
      return Math.max(preFeeInterestRate - feeRate, 0);
    }
  }

  /**
   * Returns FV = e ^ (rate * time)
   * @param interestRate in 1e9 precision
   * @param timeToMaturity seconds until maturity
   */
  public getfCashExchangeRate(interestRate: number, timeToMaturity: number) {
    const r =
      (interestRate * timeToMaturity) / (RATE_PRECISION * SECONDS_IN_YEAR);
    return Math.floor(Math.exp(r) * RATE_PRECISION);
  }

  public getIRParams(marketIndex: number) {
    return this.poolParams.interestRateCurve[marketIndex - 1];
  }

  public getMarketCashUnderlying(marketIndex: number) {
    return this.poolParams.perMarketCash[marketIndex - 1].toUnderlying();
  }

  public getTimeToMaturity(marketIndex: number, nowSeconds = getNowSeconds()) {
    const { token } = this.balances[marketIndex];
    if (!token.maturity) throw Error('Unknown maturity for fCash token');
    return token.maturity - nowSeconds;
  }

  public getProportionalHoldings(
    lpTokens: TokenBalance,
    acceptIdiosyncratic: boolean
  ) {
    const netfCashHoldings = this.getNetfCashHoldings();
    const totalPrimeCash = this.balances[0];
    const ifCashHoldings = netfCashHoldings.filter(this.isIdiosyncratic);

    if (ifCashHoldings.length === 0 || acceptIdiosyncratic) {
      // If there are no ifCash assets or the account will accept them, then return the
      // proportional holdings of all the fCash assets
      return {
        primeCash: totalPrimeCash.scale(lpTokens, this.totalSupply),
        netfCash: netfCashHoldings.map((f) =>
          f.scale(lpTokens, this.totalSupply)
        ),
        redemptionFee: this.getZeroUnderlying(),
      };
    } else {
      // Get the value of ifCash holdings in risk adjusted present value.
      const totalMarketUnderlyingCash = this.poolParams.perMarketCash
        .reduce((acc, c) => acc.add(c), totalPrimeCash.copy(0))
        .toUnderlying();
      const totalUnderlyingValueInMarkets = netfCashHoldings
        .reduce((acc, f) => acc.add(f.toUnderlying()), this.getZeroUnderlying())
        .add(totalMarketUnderlyingCash);

      const ifCashRiskAdjustedPV = ifCashHoldings.reduce(
        (acc, i) => acc.add(i.toRiskAdjustedUnderlying()),
        this.getZeroUnderlying()
      );

      const totalPortfolioValue =
        totalUnderlyingValueInMarkets.add(ifCashRiskAdjustedPV);

      // Get share of tokens and net fCash based on a scaleFactor:
      //  (totalPortfolioValue * lpTokens) / (totalUnderlyingValueInMarkets * totalSupply)
      const numerator = totalPortfolioValue.n.mul(lpTokens.n);
      const denominator = totalUnderlyingValueInMarkets.n.mul(
        this.totalSupply.n
      );

      const nTokenCashShare = this.poolParams.nTokenCash.scale(
        lpTokens,
        this.totalSupply
      );

      const primeCash = totalMarketUnderlyingCash
        .scale(numerator, denominator)
        .toToken(this.balances[0].token)
        .add(nTokenCashShare);

      const netfCash = netfCashHoldings
        .filter((f) => !this.isIdiosyncratic(f))
        .map((f) => f.scale(numerator, denominator));

      const totalValueRedeemedPrime = primeCash.add(
        netfCash
          .reduce((_, f) => f.toUnderlying(), this.getZeroUnderlying())
          .toToken(primeCash.token)
      );
      // Redemption fee is the difference between the total value redeemed and the oracle value
      const redemptionFee = this.getLPTokenOracleValue(lpTokens, 0)
        .sub(totalValueRedeemedPrime)
        .toUnderlying();

      return {
        primeCash,
        netfCash,
        redemptionFee,
      };
    }
  }

  public getNetfCashHoldings() {
    return this.poolParams.nTokenFCash.map((f) => {
      const marketfCash = this.balances.find((t) => t.typeKey === f.typeKey);
      return marketfCash ? f.add(marketfCash) : f;
    });
  }

  public isIdiosyncratic(fCash: TokenBalance) {
    return this.balances.findIndex((t) => t.typeKey === fCash.typeKey) === -1;
  }

  public getZeroUnderlying() {
    return this.balances[0].toUnderlying().copy(0);
  }
}
