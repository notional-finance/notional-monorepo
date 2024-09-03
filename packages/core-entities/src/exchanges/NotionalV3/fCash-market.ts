import { AggregateCall } from '@notional-finance/multicall';
import {
  AssetType,
  BASIS_POINT,
  DELEVERAGE_BUFFER,
  encodeERC1155Id,
  getNowSeconds,
  INTERNAL_TOKEN_DECIMALS,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  RATE_DECIMALS,
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
import { Registry } from '../../Registry';
import {
  BaseNotionalMarket,
  InterestRateParameters,
} from './BaseNotionalMarket';
import { TokenDefinition } from '../../Definitions';

interface fCashMarketParams {
  perMarketCash: TokenBalance[];
  perMarketfCash: TokenBalance[];
  nTokenFCash: TokenBalance[];
  nTokenCash: TokenBalance;
  currencyId: number;
  interestRateCurve: InterestRateParameters[];
}

export class fCashMarket extends BaseNotionalMarket<fCashMarketParams> {
  /**
   * fCash markets are modeled as multiple token AMM.
   * this.balance[0] is the total cash held by the nToken
   * this.balance[1+] are the net fCash balances held by the nToken.
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
    poolParams.perMarketfCash = _balances;

    // Account for the nToken's net fcash balances
    const netBalances = _balances.map((b) => {
      const negfCash = poolParams.nTokenFCash.find(
        (t) => t.typeKey === b.typeKey
      );
      if (!negfCash) throw Error('matching fCash balance not found');
      return b.add(negfCash);
    });

    const balances = [totalCash, ...netBalances];
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
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ): {
    tokensOut: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    const tokenIndexIn = this.getTokenIndex(tokensIn.token);

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
      feesPaid[0] = fee.toPrimeCash();

      return { feesPaid, tokensOut: fCashAmount };
    } else if (tokenIndexOut == 0) {
      // Withdrawing cash, depositing fCash
      const { underlyingCash, fee } = this.getCashGivenfCashAmount(
        tokenIndexIn, // market index
        tokensIn.neg(),
        balanceOverrides
      );
      const feesPaid = this.zeroTokenArray();
      feesPaid[0] = fee.toPrimeCash();

      return {
        feesPaid,
        tokensOut: underlyingCash.neg().toToken(this.balances[0].token),
      };
    } else {
      throw Error('One token index in or out must be zero');
    }
  }

  /**
   * Calculates the amount of nTokens minted given a prime cash deposit
   * @param tokensIn Must always be a balance of prime cash
   * @returns nTokens minted, fees paid is always an array of zeros
   */
  public getLPTokensGivenTokens(tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
  } {
    // Only tokensIn[0] can be specified
    tokensIn.forEach((v, i) => {
      if (i > 0 && !v.isZero()) throw Error('Tokens in must be prime cash');
    });
    tokensIn[0].isMatch(this.balances[0]);

    const nTokenOracleRate = Registry.getOracleRegistry().getLatestFromSubject(
      this._network,
      `${this.totalSupply.underlying.id}:${this.totalSupply.tokenId}:nTokenToUnderlyingExchangeRate`
    )?.latestRate.rate;
    if (nTokenOracleRate === undefined)
      throw Error('nToken Oracle Rate not found');

    const lpTokenSpotValue = this.getNTokenSpotValue();
    const lpTokenOracleValue = TokenBalance.zero(this.totalSupply.underlying)
      .copy(this.totalSupply.mulInRatePrecision(nTokenOracleRate).n)
      .scaleFromInternal()
      .toPrimeCash();

    try {
      const { maxMintDeviationBasisPoints } =
        Registry.getConfigurationRegistry().getConfig(
          this._network,
          this.totalSupply.currencyId
        );
      const deviationLimit = lpTokenOracleValue
        .sub(lpTokenSpotValue)
        .abs()
        .ratioWith(lpTokenOracleValue)
        .toNumber();
      if (
        maxMintDeviationBasisPoints &&
        maxMintDeviationBasisPoints < deviationLimit
      ) {
        throw Error(
          'Liquidity providing is unavailable due to high fixed rate volatility. Check back later.'
        );
      }
    } catch (e) {
      console.error(e);
    }

    const lpTokens = this.totalSupply.scale(
      tokensIn[0],
      // Use the greater of the two values
      lpTokenOracleValue.gt(lpTokenSpotValue)
        ? lpTokenOracleValue
        : lpTokenSpotValue
    );
    // NOTE: this is not correct in the face of deleverage ntoken
    const lpClaims = this.getLPTokenClaims(lpTokens);
    const feesPaid = this.zeroTokenArray();
    // Adds the prime cash deposited value into the nToken and adds the total supply minted
    // in the following line.
    const postMintSpotValue = this.getPostMintSpotValue(tokensIn[0]).add(
      tokensIn[0]
    );
    feesPaid[0] = tokensIn[0].sub(
      postMintSpotValue.scale(lpTokens, this.totalSupply.add(lpTokens))
    );
    // console.log(`
    // POST MINT SPOT VALUE:
    // ${tokensIn[0]
    //   .copy(INTERNAL_TOKEN_PRECISION)
    //   .toUnderlying()
    //   .toDisplayStringWithSymbol(8, false, false)}
    // ${nTokenOracleRate.toString()}
    // ${this.totalSupply.toDisplayStringWithSymbol(4, false, false)}
    // ${tokensIn[0].toDisplayStringWithSymbol(4, false, false)}
    // ${postMintSpotValue
    //   .scale(lpTokens, this.totalSupply)
    //   .toDisplayStringWithSymbol(4, false, false)}
    // ${lpTokenOracleValue
    //   .toUnderlying()
    //   .toDisplayStringWithSymbol(4, false, false)}
    // ${lpTokenSpotValue
    //   .toUnderlying()
    //   .toDisplayStringWithSymbol(4, false, false)}
    // ${postMintSpotValue
    //   .toUnderlying()
    //   .toDisplayStringWithSymbol(4, false, false)}
    // ${feesPaid[0].toDisplayStringWithSymbol(4, false, false)}
    // `);

    return {
      feesPaid,
      lpTokens,
      lpClaims,
    };
  }

  /**
   * Simulates an nToken redemption. If doing a single sided exit (only single sided exit to pCash is allowed), then
   * will simulate selling residuals.
   * @param lpTokens amount of ntokens to redeem
   * @param singleSidedExitTokenIndex if set to zero then will simulate selling net fCash positions during exit
   */
  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: TokenBalance[];
    feesPaid: TokenBalance[];
  } {
    if (singleSidedExitTokenIndex == 0) {
      // Simulate selling fCash
      const {
        primeCash,
        netfCash,
        postRedeemMarketCash,
        postRedeemMarketfCash,
      } = this.getProportionalHoldings(lpTokens, false);

      // Simulates selling netfCash positions
      const { totalFees, netUnderlyingCash } = netfCash.reduce(
        ({ totalFees, netUnderlyingCash }, fCash, i) => {
          if (fCash.isZero()) return { totalFees, netUnderlyingCash };

          const { fee, underlyingCash } = this.getCashGivenfCashAmount(
            i + 1,
            fCash.neg(),
            undefined,
            postRedeemMarketCash,
            postRedeemMarketfCash
          );
          return {
            totalFees: totalFees.add(fee),
            netUnderlyingCash: netUnderlyingCash.add(underlyingCash.neg()),
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

  public getNTokenBlendedYield(
    netNTokens?: TokenBalance,
    additionalPrimeDebt?: TokenBalance
  ) {
    const { numerator, denominator } = this.balances
      .map((b) => {
        const underlying = b.toUnderlying();
        const apy =
          b.tokenType === 'PrimeCash'
            ? (this.getPrimeSupplyRate(
                this.getPrimeCashUtilization(
                  netNTokens?.toPrimeCash() || b.copy(0),
                  additionalPrimeDebt
                )
              ) *
                100) /
              RATE_PRECISION
            : this.getSpotInterestRate(b.token);
        if (apy === undefined) {
          throw Error(`${b.symbol} yield not found`);
        }

        // Blended yield is the weighted average of the APYs
        return {
          numerator: underlying
            .mulInRatePrecision(Math.floor(apy * RATE_PRECISION))
            .toFloat(),
          denominator: underlying.toFloat(),
        };
      })
      .reduce(
        (r, { numerator, denominator }) => ({
          numerator: r.numerator + numerator,
          denominator: r.denominator + denominator,
        }),
        { numerator: 0, denominator: 0 }
      );

    // This is the blended nToken APY
    return numerator / denominator;
  }

  /***********************************************************************/
  /*                  fCash Interest Curve Calculations                  */
  /***********************************************************************/

  public getPostMintSpotValue(amountIn: TokenBalance) {
    const { leverageThresholds, depositShares, fCashReserveFeeSharePercent } =
      Registry.getConfigurationRegistry().getConfig(
        this._network,
        this.totalSupply.currencyId
      );
    if (
      !leverageThresholds ||
      !depositShares ||
      fCashReserveFeeSharePercent === undefined
    )
      throw Error('Config not found');

    const postTradeSpotRates = this.balances.map((b, marketIndex) => {
      if (marketIndex == 0) return RATE_PRECISION;

      const i = marketIndex - 1;
      const timeToMaturity = this.getTimeToMaturity(marketIndex);
      const utilization = this.getfCashUtilization(
        b.copy(0),
        this._getTotalfCash(marketIndex),
        this.getMarketCashUnderlying(marketIndex)
      );
      // console.log(`
      // IN POST TRADE SPOT RATES ${marketIndex}:
      // ${utilization / RATE_PRECISION}
      // ${leverageThresholds[i] / RATE_PRECISION}
      // ${this.poolParams.perMarketfCash[
      //   marketIndex - 1
      // ].toDisplayStringWithSymbol(8, false, false)}
      // ${this.poolParams.perMarketCash[
      //   marketIndex - 1
      // ].toDisplayStringWithSymbol(8, false, false)}
      // ${this.getMarketCashUnderlying(marketIndex).toDisplayStringWithSymbol(
      //   8,
      //   false,
      //   false
      // )}
      // ${this.getfCashSpotRateInRP(b.token)}
      // `);
      // console.log(this.getIRParams(marketIndex));

      if (utilization < leverageThresholds[i]) {
        return this.getInterestRate(marketIndex, utilization);
      } else {
        // Calculate the deleverage market trade
        const deleverageInterestRate = Math.max(
          this.getfCashSpotRateInRP(b.token) - DELEVERAGE_BUFFER,
          0
        );
        const assumedExchangeRate = this.getfCashExchangeRate(
          deleverageInterestRate,
          timeToMaturity
        );
        const marketDeposit = amountIn
          .scale(depositShares[i], INTERNAL_TOKEN_PRECISION)
          .toUnderlying();
        const fCashAmountAssumed = b.copy(
          marketDeposit
            .mulInRatePrecision(assumedExchangeRate)
            .scaleTo(INTERNAL_TOKEN_DECIMALS)
        );

        let fCashAmountActual: TokenBalance;
        let cashToMarket: TokenBalance;
        try {
          // If this throws an error than the contract would fail as well
          fCashAmountActual = this.getfCashGivenCashAmount(
            marketIndex,
            marketDeposit.neg()
          );
          const { fee } = this.getCashGivenfCashAmount(
            marketIndex,
            fCashAmountActual
          );
          cashToMarket = marketDeposit
            .sub(fee.scale(BigNumber.from(fCashReserveFeeSharePercent), 100))
            .toUnderlying();

          // console.log(`
          // CALCULATED POST TRADE ${marketIndex}
          // ${deleverageInterestRate / RATE_PRECISION}
          // ${assumedExchangeRate / RATE_PRECISION}
          // ${marketDeposit.toDisplayStringWithSymbol(4, false, false)}
          // ${fCashAmountAssumed.toDisplayStringWithSymbol(4, false, false)}
          // ${fCashAmountActual.toDisplayStringWithSymbol(4, false, false)}
          // ${fee.toDisplayString()}
          // ${cashToMarket.toDisplayStringWithSymbol(4, false, false)}
          // ${this.getImpliedInterestRate(marketDeposit, fCashAmountActual) || 0}
          // `);

          if (fCashAmountActual.lte(fCashAmountAssumed)) {
            throw Error(
              'Cannot mint due to high fixed rate utilization, try a smaller amount.'
            );
          }
        } catch (e) {
          throw Error(
            'Cannot mint due to high fixed rate utilization, try a smaller amount.'
          );
        }

        // This calculates the post trade utilization
        const newUtilization = this.getfCashUtilization(
          fCashAmountActual.copy(0),
          this.poolParams.perMarketfCash[i].sub(fCashAmountActual),
          this.poolParams.perMarketCash[i].toUnderlying().add(cashToMarket)
        );
        // console.log('NEW UTILIZATION', newUtilization);
        return this.getInterestRate(marketIndex, newUtilization);
      }
    });
    // console.log('RETURNED POST TRADE SPOT RATES', postTradeSpotRates);

    return this.getNTokenSpotValue(postTradeSpotRates);
  }

  public getNTokenSpotValue(spotRates?: number[]) {
    const primaryToken = this.balances[0].token;
    return (
      this.balances
        .map((b, marketIndex) => {
          if (marketIndex === 0) return b;
          const spotExchangeRate = this.getfCashExchangeRate(
            spotRates
              ? spotRates[marketIndex]
              : this.getfCashSpotRateInRP(b.token),
            this.getTimeToMaturity(marketIndex)
          );

          // b is in 8 decimal precision, after the exchange rate it is in 8
          // decimal underlying precision
          return TokenBalance.from(
            b.divInRatePrecision(spotExchangeRate).n,
            b.underlying
          )
            .scaleFromInternal()
            .toPrimeCash();
        })
        // Sum all balances in primary valuation
        .reduce((v, i) => v.add(i), TokenBalance.zero(primaryToken))
    );
  }

  /**
   * Calculates the amount of fCash given a prime cash amount
   *
   * @param cashAmount a token balance in prime cash denomination
   * @param balanceOverrides if provided, must be denominated in net fCash
   */
  private getfCashGivenCashAmount(
    marketIndex: number,
    cashAmount: TokenBalance,
    balanceOverrides?: TokenBalance[],
    nowSeconds = getNowSeconds()
  ) {
    const irParams = this.getIRParams(marketIndex);
    const totalfCash = this._getTotalfCash(marketIndex, balanceOverrides);
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

  private getCashGivenfCashAmount(
    marketIndex: number,
    fCashAmount: TokenBalance,
    balanceOverrides?: TokenBalance[],
    cashBalanceOverride?: TokenBalance[],
    fCashBalanceOverride?: TokenBalance[],
    nowSeconds = getNowSeconds()
  ) {
    const totalfCash = fCashBalanceOverride
      ? fCashBalanceOverride[marketIndex - 1]
      : this._getTotalfCash(marketIndex, balanceOverrides);
    const totalCashUnderlying = this.getMarketCashUnderlying(
      marketIndex,
      cashBalanceOverride
    );

    const utilization = this.getfCashUtilization(
      fCashAmount,
      totalfCash,
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

    const fee = preFeeCashToAccount.sub(postFeeCashToAccount).abs();

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

  protected getIRParams(marketIndex: number) {
    if (marketIndex === 0) {
      const primeCashCurve = Registry.getConfigurationRegistry().getConfig(
        this._network,
        this.poolParams.currencyId
      ).primeCashCurve;
      if (!primeCashCurve) throw Error('Prime Cash Curve not defined');
      return primeCashCurve;
    }

    return this.poolParams.interestRateCurve[marketIndex - 1];
  }

  private getMarketCashUnderlying(
    marketIndex: number,
    marketCashBalanceOverride?: TokenBalance[]
  ) {
    return (marketCashBalanceOverride || this.poolParams.perMarketCash)[
      marketIndex - 1
    ].toUnderlying();
  }

  private getTimeToMaturity(marketIndex: number, nowSeconds = getNowSeconds()) {
    const { token } = this.balances[marketIndex];
    if (!token.maturity) throw Error('Unknown maturity for fCash token');
    return token.maturity - nowSeconds;
  }

  private getProportionalHoldings(
    lpTokens: TokenBalance,
    acceptIdiosyncratic: boolean
  ) {
    const totalPrimeCash = this.balances[0];
    const ifCashHoldings = this.balances.filter((f) => this.isIdiosyncratic(f));

    if (ifCashHoldings.length === 0 || acceptIdiosyncratic) {
      // If there are no ifCash assets or the account will accept them, then return the
      // proportional holdings of all the fCash assets
      const [primeCash, ...netfCash] = this.getLPTokenClaims(lpTokens);
      const postRedeemMarketCash = this.poolParams.perMarketCash.map((c) => {
        return c.sub(c.scale(lpTokens, this.totalSupply));
      });
      const postRedeemMarketfCash = this.poolParams.perMarketfCash.map((c) => {
        return c.sub(c.scale(lpTokens, this.totalSupply));
      });

      return {
        primeCash,
        netfCash,
        redemptionFee: this.getZeroUnderlying(),
        postRedeemMarketCash,
        postRedeemMarketfCash,
      };
    } else {
      // Get the value of ifCash holdings in risk adjusted present value.
      const totalMarketPrimeCash = this.poolParams.perMarketCash.reduce(
        (acc, c) => acc.add(c),
        totalPrimeCash.copy(0)
      );

      const totalPrimeValueInMarkets = this.balances
        .reduce((acc, f) => acc.add(f.toUnderlying()), this.getZeroUnderlying())
        .toToken(totalMarketPrimeCash.token)
        .add(totalMarketPrimeCash);

      const ifCashRiskAdjustedPV = ifCashHoldings
        .reduce(
          (acc, i) => acc.add(i.toRiskAdjustedUnderlying()),
          this.getZeroUnderlying()
        )
        .toToken(totalMarketPrimeCash.token);

      const totalPortfolioValue =
        totalPrimeValueInMarkets.add(ifCashRiskAdjustedPV);

      // Get share of tokens and net fCash based on a scaleFactor:
      //  (totalPortfolioValue * lpTokens) / (totalUnderlyingValueInMarkets * totalSupply)
      const numerator = totalPortfolioValue.n.mul(lpTokens.n);
      const denominator = totalPrimeValueInMarkets.n.mul(this.totalSupply.n);

      const nTokenCashShare = this.poolParams.nTokenCash.scale(
        lpTokens,
        this.totalSupply
      );

      const primeCash = totalMarketPrimeCash
        .scale(numerator, denominator)
        .add(nTokenCashShare);

      const postRedeemMarketCash = this.poolParams.perMarketCash.map((c) => {
        return c.sub(c.scale(numerator, denominator));
      });
      const postRedeemMarketfCash = this.poolParams.perMarketfCash.map((c) => {
        return c.sub(c.scale(numerator, denominator));
      });

      const netfCash = this.balances
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
        postRedeemMarketCash,
        postRedeemMarketfCash,
      };
    }
  }

  private _getTotalfCash(
    marketIndex: number,
    balanceOverrides?: TokenBalance[]
  ) {
    if (balanceOverrides) {
      // Balance overrides is a different netfCash amount, so to get the total market fcash
      // we need to subtract the nToken fcash
      const netfCash = this.poolParams.nTokenFCash.find(
        (t) => t.typeKey === balanceOverrides[marketIndex].typeKey
      );
      if (!netfCash) throw Error('net fcash not found');

      return balanceOverrides[marketIndex].sub(netfCash);
    } else {
      return this.poolParams.perMarketfCash[marketIndex - 1];
    }
  }

  public getMarketUtilization() {
    const currentUtilization = this.poolParams.perMarketfCash.map((_, i) => {
      return this.getfCashUtilization(
        this.poolParams.perMarketfCash[i].copy(0),
        this.poolParams.perMarketfCash[i],
        this.poolParams.perMarketCash[i].toUnderlying()
      );
    });
    const isHighUtilization = this.poolParams.interestRateCurve.reduce(
      (acc, { kinkUtilization2 }, i) => {
        acc[this.poolParams.perMarketfCash[i].tokenId] =
          currentUtilization[i] > kinkUtilization2;
        return acc;
      },
      {} as Record<string, boolean>
    );

    return isHighUtilization;
  }

  public isIdiosyncratic(fCash: TokenBalance) {
    return this.balances.findIndex((t) => t.typeKey === fCash.typeKey) === -1;
  }

  private getZeroUnderlying() {
    return this.balances[0].toUnderlying().copy(0);
  }

  protected getfCashSpotRateInRP(token: TokenDefinition) {
    const marketIndex = this.getMarketIndex(token.maturity);
    const utilization = this.getfCashUtilization(
      this.poolParams.perMarketfCash[marketIndex - 1].copy(0),
      this.poolParams.perMarketfCash[marketIndex - 1],
      this.poolParams.perMarketCash[marketIndex - 1].toUnderlying()
    );
    return this.getInterestRate(marketIndex, utilization);
  }

  protected getfCashSpotRate(token: TokenDefinition) {
    return (this.getfCashSpotRateInRP(token) * 100) / RATE_PRECISION;
  }

  public getSlippageRate(fCash: TokenBalance, slippageFactor: number) {
    const { underlyingCash } = this.getCashGivenfCashAmount(
      this.getMarketIndex(fCash.token.maturity),
      fCash
    );
    const impliedRate = this.getImpliedInterestRate(underlyingCash, fCash);
    if (!impliedRate) throw Error('Trade failed');

    return Math.max(
      fCash.isPositive()
        ? impliedRate - slippageFactor
        : impliedRate + slippageFactor,
      0
    );
  }

  public getMarketIndex(maturity?: number) {
    const index = this.balances.findIndex((t) => t.token.maturity === maturity);
    if (index === -1) throw Error('Market index not found');
    return index;
  }

  public getImpliedInterestRate(
    cash: TokenBalance,
    fCash: TokenBalance,
    blockTime = getNowSeconds()
  ) {
    return fCashMarket.getImpliedInterestRate(cash, fCash, blockTime);
  }

  public static getImpliedInterestRate(
    cash: TokenBalance,
    fCash: TokenBalance,
    blockTime = getNowSeconds()
  ) {
    if (cash.isZero()) return undefined;

    const exchangeRate = fCash
      .divInRatePrecision(cash.toUnderlying().scaleTo(RATE_DECIMALS))
      .scaleTo(RATE_DECIMALS)
      .abs()
      .toNumber();
    const timeToMaturity = (fCash.token.maturity || 0) - blockTime;

    // ln(exchangeRate) * SECONDS_IN_YEAR / timeToMaturity
    return Math.trunc(
      ((Math.log(exchangeRate / RATE_PRECISION) * SECONDS_IN_YEAR) /
        timeToMaturity) *
        RATE_PRECISION
    );
  }

  public static tenor(marketIndex: number): string {
    switch (marketIndex) {
      case 1:
        return '3 Month';
      case 2:
        return '6 Month';
      case 3:
        return '1 Year';
      case 4:
        return '2 Year';
      case 5:
        return '5 Year';
      case 6:
        return '10 Year';
      case 7:
        return '20 Year';
      default:
        return 'Unknown';
    }
  }

  public getfCashPriceExposure(
    fCash: TokenBalance,
    purchasePrice: TokenBalance,
    tickSize = 50 * BASIS_POINT,
    blockTime = getNowSeconds()
  ) {
    const marketIndex = this.getMarketIndex(fCash.maturity);
    const { maxRate } = this.poolParams.interestRateCurve[marketIndex - 1];
    const timeToMaturity = (fCash.maturity || 0) - blockTime;
    const unit = TokenBalance.unit(this.getZeroUnderlying().token);

    return Array(Math.ceil(maxRate / tickSize))
      .fill(0)
      .map((_, i) => {
        const interestRate = i * tickSize;
        const price = unit.mulInRatePrecision(
          this.getfCashPV(interestRate, timeToMaturity)
        );
        const profitLoss = price
          .sub(purchasePrice)
          .scale(fCash.n, fCash.precision);

        return {
          interestRate: (interestRate * 100) / RATE_PRECISION,
          price,
          profitLoss,
        };
      });
  }

  public getNTokenPriceExposure(
    nTokens: TokenBalance,
    tickSize = 50 * BASIS_POINT,
    blockTime = getNowSeconds()
  ) {
    const maxRate = Math.max(
      ...this.poolParams.interestRateCurve.map((i) => i.maxRate)
    );
    const nTokenPrice = TokenBalance.unit(nTokens.token).toUnderlying();
    const totalSupply = this.totalSupply;

    return Array(Math.floor(maxRate / tickSize))
      .fill(0)
      .map((_, i) => {
        const interestRate = (i + 1) * tickSize;
        // Scale the total residual change by the total supply
        const netPrice = this._getSimulatedNTokenPriceChange(
          interestRate,
          blockTime
        ).scale(totalSupply.precision, totalSupply.n);
        const price = nTokenPrice.add(netPrice);

        const profitLoss = price
          .sub(nTokenPrice)
          .scale(nTokens.n, nTokens.precision);

        return {
          interestRate: (interestRate * 100) / RATE_PRECISION,
          price,
          profitLoss,
        };
      });
  }

  private _getSimulatedNTokenPriceChange(
    interestRate: number,
    blockTime = getNowSeconds()
  ) {
    return this.zeroTokenArray()
      .slice(1)
      .map((t, i) => {
        const spotRate = this.getSpotInterestRate(t.token);
        if (!spotRate) throw Error('Spot Rate undefined');
        const timeToMaturity = t.maturity - blockTime;
        const netfCashPV =
          this.getfCashPV(interestRate, timeToMaturity) -
          this.getfCashPV(
            // Spot rates are returned as percentages
            Math.floor((spotRate * RATE_PRECISION) / 100),
            timeToMaturity
          );

        const utilization = this.getUtilization(i + 1, interestRate);
        // Assume that we trade at 1-1:
        //  (per market cash in underlying 8 decimals +
        //  per market fCash) * utilization - perMarketfCash
        const additionalResiduals = this.poolParams.perMarketCash[i]
          .toUnderlying()
          .scaleTo(INTERNAL_TOKEN_DECIMALS)
          .add(this.poolParams.perMarketfCash[i].n)
          .mul(utilization)
          .div(RATE_PRECISION)
          .sub(this.poolParams.perMarketfCash[i].n);

        const totalResiduals = this.balances[i + 1].add(
          this.balances[i + 1].copy(additionalResiduals)
        );

        // This is the the net nToken profit loss in the maturity
        return totalResiduals.mulInRatePrecision(netfCashPV);
      })
      .reduce(
        (s, pnl) => s.add(s.copy(pnl.n).scaleFromInternal()),
        this.getZeroUnderlying()
      );
  }

  private getUtilization(marketIndex: number, interestRate: number) {
    const irParams = this.getIRParams(marketIndex);
    if (interestRate <= irParams.kinkRate1) {
      return Math.floor(
        (interestRate * irParams.kinkUtilization1) / irParams.kinkRate1
      );
    } else if (interestRate <= irParams.kinkRate2) {
      return Math.floor(
        ((interestRate - irParams.kinkRate1) *
          (irParams.kinkUtilization2 - irParams.kinkUtilization1)) /
          (irParams.kinkRate2 - irParams.kinkRate1) +
          irParams.kinkUtilization1
      );
    } else {
      return Math.floor(
        ((interestRate - irParams.kinkRate2) *
          (RATE_PRECISION - irParams.kinkUtilization2)) /
          (irParams.maxRate - irParams.kinkRate2) +
          irParams.kinkUtilization2
      );
    }
  }
}
