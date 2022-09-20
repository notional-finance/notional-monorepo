import { BigNumber, utils } from 'ethers';
import { getNowSeconds } from '../libs/utils';
import { INTERNAL_TOKEN_PRECISION, RATE_PRECISION, SECONDS_IN_YEAR, MAX_MARKET_PROPORTION } from '../config/constants';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';

interface MarketData {
  totalfCash: TypedBigNumber;
  totalAssetCash: TypedBigNumber;
  totalLiquidity: TypedBigNumber;
  lastImpliedRate: number;
  oracleRate: number;
  previousTradeTime: number;
}

export default class Market {
  private _market: MarketData = {
    totalfCash: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, this.underlyingSymbol),
    totalAssetCash: TypedBigNumber.from(0, BigNumberType.InternalAsset, this.assetSymbol),
    totalLiquidity: TypedBigNumber.from(0, BigNumberType.LiquidityToken, this.assetSymbol),
    lastImpliedRate: 0,
    oracleRate: 0,
    previousTradeTime: 0,
  };

  public get hashKey() {
    return utils.id(
      [
        this.marketKey,
        this._market.totalfCash.toString(),
        this._market.totalAssetCash.toString(),
        this._market.totalLiquidity.toString(),
        this._market.lastImpliedRate,
        this._market.oracleRate,
        this._market.previousTradeTime,
      ].join(':')
    );
  }

  public get market(): MarketData {
    return this._market;
  }

  public get marketKey(): string {
    return `${this.currencyId}:${this.marketIndex}:${this.maturity}`;
  }

  public get totalfCashDisplayString(): string {
    return this.market.totalfCash.toDisplayString();
  }

  public get totalCashUnderlyingDisplayString(): string {
    return this.market.totalAssetCash.toUnderlying().toDisplayString();
  }

  public get totalAssetCashDisplayString(): string {
    return this.market.totalAssetCash.toDisplayString();
  }

  public get totalLiquidityDisplayString(): string {
    return this.market.totalLiquidity.toDisplayString();
  }

  public get fCashUtilization(): number {
    return (
      this.market.totalfCash
        .scale(RATE_PRECISION, this.market.totalfCash.add(this.market.totalAssetCash.toUnderlying()).n)
        .toNumber() / RATE_PRECISION
    );
  }

  public get hasLiquidity(): boolean {
    return !this.market.totalLiquidity.isZero();
  }

  public get midRate(): string {
    try {
      return Market.formatInterestRate(this.marketAnnualizedRate());
    } catch {
      return '';
    }
  }

  public get tenor(): string {
    switch (this.marketIndex) {
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

  public setMarket(m: MarketData) {
    this._market = m;
  }

  constructor(
    public currencyId: number,
    public marketIndex: number,
    public maturity: number,
    public rateScalar: number,
    public totalFee: number,
    public reserveFeeShare: number,
    public rateOracleTimeWindow: number,
    public assetSymbol: string,
    public underlyingSymbol: string
  ) {}

  /**
   * Copies a market object for simulation
   * @param market
   * @returns a market object that is mutable
   */
  public static copy(market: Market) {
    const copy = new Market(
      market.currencyId,
      market.marketIndex,
      market.maturity,
      market.rateScalar,
      market.totalFee,
      market.reserveFeeShare,
      market.rateOracleTimeWindow,
      market.assetSymbol,
      market.underlyingSymbol
    );

    const originalMarketData = market.market;
    copy.setMarket({
      totalfCash: originalMarketData.totalfCash.copy(),
      totalAssetCash: originalMarketData.totalAssetCash.copy(),
      totalLiquidity: originalMarketData.totalLiquidity.copy(),
      lastImpliedRate: originalMarketData.lastImpliedRate,
      oracleRate: originalMarketData.oracleRate,
      previousTradeTime: originalMarketData.previousTradeTime,
    });
    return copy;
  }

  /**
   * Formats rates as a string with a given precision.
   *
   * @param rate rate to format
   * @param precision amount of decimals to return (default: 3)
   * @return formatted rate string
   */
  public static formatInterestRate(rate: number, precision = 3) {
    if (rate === undefined) return '';
    const rateValue = (rate / RATE_PRECISION) * 100;
    // This removes the leading (-) when we have a -0.000% rate
    const rateString = Math.abs(rateValue) < 10 ** -precision ? (0).toFixed(precision) : rateValue.toFixed(precision);

    return `${rateString}%`;
  }

  /**
   * Converts an exchange rate to an annual interest rate: ln(exchangeRate) * SECONDS_IN_YEAR / timeToMaturity
   *
   * @param exchangeRate
   * @param blockTime block time the exchange occurs on
   * @param maturity block height when the market will mature
   * @return annualized interest rate in 1e9 precision
   */
  public static exchangeToInterestRate(exchangeRate: number, blockTime: number, maturity: number): number {
    const timeToMaturity = maturity - blockTime;
    if (timeToMaturity < 0) {
      throw new RangeError('timeToMaturity < 0, cannot convert an exchange rate in a matured period.');
    }

    const annualRate = ((Math.log(exchangeRate / RATE_PRECISION) * SECONDS_IN_YEAR) / timeToMaturity) * RATE_PRECISION;
    return Math.trunc(annualRate);
  }

  /**
   * Converts an interest rate to an exchange rate: e ^ (annualRate * timeToMaturity / SECONDS_IN_YEAR)
   *
   * @param annualRate
   * @param blockTime block time the exchange occurs on
   * @param maturity block height when the market will mature
   * @return exchange rate
   */
  public static interestToExchangeRate(annualRate: number, blockTime: number, maturity: number): number {
    const timeToMaturity = maturity - blockTime;
    if (timeToMaturity < 0) {
      throw new RangeError('timeToMaturity < 0, cannot convert an exchange rate in a matured period.');
    }

    const exchangeRate = Math.exp((annualRate * timeToMaturity) / SECONDS_IN_YEAR / RATE_PRECISION) * RATE_PRECISION;
    return Math.trunc(exchangeRate);
  }

  public static fCashFromExchangeRate(exchangeRate: number, cash: TypedBigNumber): TypedBigNumber {
    cash.checkType(BigNumberType.InternalUnderlying);
    return cash.scale(exchangeRate, RATE_PRECISION);
  }

  public static cashFromExchangeRate(exchangeRate: number, fCash: TypedBigNumber): TypedBigNumber {
    fCash.checkType(BigNumberType.InternalUnderlying);
    return fCash.scale(RATE_PRECISION, exchangeRate);
  }

  public static exchangeRate(fCashAmount: TypedBigNumber, cashAmount: TypedBigNumber): number {
    fCashAmount.checkType(BigNumberType.InternalUnderlying);
    cashAmount.checkType(BigNumberType.InternalUnderlying);

    return fCashAmount.scale(RATE_PRECISION, cashAmount.n).abs().toNumber();
  }

  /**
   * Returns a new fCash amount after applying some amount of slippage
   *
   * @param fCashAmount
   * @param cashAmount
   * @param maturity
   * @param annualizedSlippage positive or negative amount of slippage in annualized basis points
   * @param blockTime
   * @returns new fCash amount with slippage applied and the new implied rate
   */
  public static getSlippageRate(
    fCashAmount: TypedBigNumber,
    cashAmount: TypedBigNumber,
    maturity: number,
    annualizedSlippage: number,
    blockTime = getNowSeconds()
  ) {
    const exchangeRate = Market.exchangeRate(fCashAmount, cashAmount);
    const exchangeSlippageFactor = Market.interestToExchangeRate(annualizedSlippage, blockTime, maturity);

    // Exchange rates are non-linear so we apply slippage using the exponent identity:
    // exchangeRatePostSlippage = e^((r + delta) * t)
    // exchangeRate = e^(r * t)
    // slippageFactor = e^(delta * t)
    // exchangeRatePostSlippage = exchangeRate * slippageFactor
    const exchangeRatePostSlippage = BigNumber.from(exchangeRate)
      .mul(exchangeSlippageFactor)
      .div(RATE_PRECISION)
      .toNumber();

    const annualizedRate = Market.exchangeToInterestRate(exchangeRatePostSlippage, blockTime, maturity);

    // TODO: expose some specific lending and borrowing methods here to adjust cash or fCash
    return {
      annualizedRate: annualizedRate < 0 ? 0 : annualizedRate,
      exchangeRatePostSlippage,
    };
  }

  public interestRate(fCashAmount: TypedBigNumber, cashAmount: TypedBigNumber, blockTime = getNowSeconds()) {
    return Market.exchangeToInterestRate(Market.exchangeRate(fCashAmount, cashAmount), blockTime, this.maturity);
  }

  /**
   * Returns the current market rate.
   *
   * @category Calculation
   * @returns exchange rate at `blockTime`
   */
  public marketAnnualizedRate(blockTime = getNowSeconds()) {
    return Market.exchangeToInterestRate(this.marketExchangeRate(blockTime), blockTime, this.maturity);
  }

  /**
   * Returns the maximum interest rate the market can support at max utilization
   */
  public maxInterestRate(blockTime = getNowSeconds()): number {
    const { rateScalar, rateAnchor } = this.getExchangeRateFactors(blockTime);

    // get exchange rate at 96% utilization
    const exchangeRate = Market.logProportion(BigNumber.from(MAX_MARKET_PROPORTION).sub(1))
      .mul(RATE_PRECISION)
      .div(rateScalar)
      .add(rateAnchor);

    return Market.exchangeToInterestRate(exchangeRate.toNumber(), blockTime, this.maturity);
  }

  /**
   * Returns the current market exchange rate
   *
   * @category Calculation
   * @param blockTime block time where the exchange will occur
   * @returns exchange rate at `blockTime`
   */
  public marketExchangeRate(blockTime = getNowSeconds()) {
    const { rateScalar, totalCashUnderlying, rateAnchor } = this.getExchangeRateFactors(blockTime);
    const preFeeExchangeRate = this.getExchangeRate(
      totalCashUnderlying,
      rateScalar,
      rateAnchor,
      TypedBigNumber.from(0, BigNumberType.InternalUnderlying, this.underlyingSymbol)
    );
    return preFeeExchangeRate.toNumber();
  }

  public marketOracleRate(blockTime = getNowSeconds()) {
    if (!this.rateOracleTimeWindow) throw new Error('Rate oracle time window not set');

    // This can occur when using a view function get to a market state in the past
    if (this.market.previousTradeTime > blockTime) return this.market.lastImpliedRate;

    const timeDiff = blockTime - this.market.previousTradeTime;
    if (timeDiff > this.rateOracleTimeWindow) {
      // If past the time window just return the lastImpliedRate
      return this.market.lastImpliedRate;
    }

    // (currentTs - previousTs) / timeWindow
    const lastTradeWeight = Math.trunc((timeDiff * RATE_PRECISION) / this.rateOracleTimeWindow);

    // 1 - (currentTs - previousTs) / timeWindow
    const oracleWeight = RATE_PRECISION - lastTradeWeight;

    const newOracleRate = Math.trunc(
      (this.market.lastImpliedRate * lastTradeWeight + this.market.oracleRate * oracleWeight) / RATE_PRECISION
    );

    return newOracleRate;
  }

  /**
   * Calculates the amount of current cash that can be borrowed after selling the specified amount of fCash.
   *
   * @param fCashAmount amount of fCash to sell
   * @param blockTime block time where the exchange will occur
   * @returns the amount of current cash this will purchase
   */
  public getCashAmountGivenfCashAmount(fCashAmount: TypedBigNumber, blockTime = getNowSeconds()) {
    fCashAmount.check(BigNumberType.InternalUnderlying, this.underlyingSymbol);
    const { rateScalar, totalCashUnderlying, rateAnchor } = this.getExchangeRateFactors(blockTime);
    const preFeeExchangeRate = this.getExchangeRate(totalCashUnderlying, rateScalar, rateAnchor, fCashAmount);

    if (preFeeExchangeRate.lt(RATE_PRECISION)) {
      throw new Error('Cannot lend at negative interest rates');
    }

    return this.getNetCashAmounts(preFeeExchangeRate, fCashAmount, blockTime);
  }

  /**
   * Calculates the amount of fCash to be added to the portfolio for a given amount of cash. A positive amount of
   * cash represents borrowing, a negative amount of cash represents lending.
   *
   * @category Calculation
   * @param cashAmount amount of current cash to purchase
   * @param blockTime block time where the exchange will occur
   * @returns the amount of fCash that must be sold
   */
  public getfCashAmountGivenCashAmount(cashAmount: TypedBigNumber, blockTime = getNowSeconds()) {
    cashAmount.check(BigNumberType.InternalUnderlying, this.underlyingSymbol);
    return this.iterateRates(cashAmount, blockTime);
  }

  public getSimulatedMarket(interestRate: number, blockTime: number) {
    // eslint-disable-next-line max-len
    // Adapted from: https://github.com/T-Woodward/Notional-Governance/blob/63ecc334baf040d394288865282c14fbda1da100/cashMarketV2.py#L199-L229
    const { rateAnchor, totalCashUnderlying, currentExchangeRate, rateScalar } = this.getExchangeRateFactors(blockTime);

    const simulatedExchangeRate = Market.interestToExchangeRate(interestRate, blockTime, this.maturity);

    const expValue = ((simulatedExchangeRate - rateAnchor.toNumber()) * rateScalar.toNumber()) / RATE_PRECISION;
    const exp = Math.exp(expValue / RATE_PRECISION);
    const simulatedProportion = Math.floor((exp / (1 + exp)) * RATE_PRECISION);

    // Rough avg, todo: why?
    const tradedExchangeRate = Math.floor(currentExchangeRate + (simulatedExchangeRate - currentExchangeRate) / 2);
    const cashAmountToTradeDenom = Math.floor(
      tradedExchangeRate +
        // Multiply by RATE_PRECISION to bring denomination back to 1e9
        (simulatedProportion / (RATE_PRECISION - simulatedProportion)) * RATE_PRECISION
    );

    // Calculate the amount of cash required to trade the market to the given interest rate
    const cashAmountToTradeNum = this._market.totalfCash
      .scale(simulatedProportion, RATE_PRECISION - simulatedProportion)
      .sub(this._market.totalfCash);

    const cashAmountToTrade = cashAmountToTradeNum.scale(RATE_PRECISION, cashAmountToTradeDenom);
    const fCashAmountToTrade = Market.fCashFromExchangeRate(tradedExchangeRate, cashAmountToTrade);
    const totalfCash = this._market.totalfCash.add(fCashAmountToTrade);
    const totalAssetCash = totalCashUnderlying.sub(cashAmountToTrade).toAssetCash();

    const newMarket = new Market(
      this.currencyId,
      this.marketIndex,
      this.maturity,
      this.rateScalar,
      this.totalFee,
      this.reserveFeeShare,
      this.rateOracleTimeWindow,
      this.assetSymbol,
      this.underlyingSymbol
    );

    newMarket.setMarket({
      totalfCash: totalfCash.copy(),
      totalAssetCash: totalAssetCash.copy(),
      totalLiquidity: this._market.totalLiquidity.copy(),
      lastImpliedRate: interestRate,
      oracleRate: interestRate,
      previousTradeTime: blockTime,
    });

    return newMarket;
  }

  /** * Private Methods ** */
  private getExchangeRateFactors(blockTime: number) {
    const timeToMaturity = this.timeToMaturity(blockTime);
    const rateScalar = BigNumber.from(Math.trunc((this.rateScalar * SECONDS_IN_YEAR) / timeToMaturity));
    if (rateScalar.isZero()) throw new Error('Rate scalar divide by zero error');

    const totalCashUnderlying = this.market.totalAssetCash.toUnderlying();
    const exchangeRate = Market.interestToExchangeRate(this.market.lastImpliedRate, blockTime, this.maturity);
    if (exchangeRate < RATE_PRECISION) throw new Error('Interest rates cannot be negative');

    const proportion = this.market.totalfCash.n
      .mul(RATE_PRECISION)
      .div(this.market.totalfCash.add(totalCashUnderlying).n);
    const lnProportion = Market.logProportion(proportion);
    const rateAnchor = BigNumber.from(exchangeRate).sub(lnProportion.mul(RATE_PRECISION).div(rateScalar));

    return {
      rateScalar,
      totalCashUnderlying,
      rateAnchor,
      timeToMaturity,
      currentExchangeRate: exchangeRate,
    };
  }

  /**
   * Calculates the exchange rate:
   * proportion = (totalfCash - fCashAmount) / (totalfCash + totalCashUnderlying)
   * exchangeRate = ln(proportion / (1 - proportion)) * rateScalar + rateAnchor
   *
   * @param totalCashUnderlying
   * @param rateScalar
   * @param rateAnchor
   * @param fCashAmount
   * @returns
   */
  private getExchangeRate(
    totalCashUnderlying: TypedBigNumber,
    rateScalar: BigNumber,
    rateAnchor: BigNumber,
    fCashAmount: TypedBigNumber
  ) {
    const proportion = this.market.totalfCash
      .sub(fCashAmount)
      .scale(RATE_PRECISION, this.market.totalfCash.add(totalCashUnderlying).n);

    const lnProportion = Market.logProportion(proportion.n);
    return lnProportion.mul(RATE_PRECISION).div(rateScalar).add(rateAnchor);
  }

  private getNetCashAmounts(preFeeExchangeRate: BigNumber, fCashAmount: TypedBigNumber, blockTime: number) {
    const preFeeCashToAccount = fCashAmount.scale(RATE_PRECISION, preFeeExchangeRate).neg();
    const fee = Market.interestToExchangeRate(this.totalFee, blockTime, this.maturity);

    let netFee: TypedBigNumber;
    if (fCashAmount.n.gt(0)) {
      const postFeeExchangeRate = preFeeExchangeRate.mul(RATE_PRECISION).div(fee);
      if (postFeeExchangeRate.lt(RATE_PRECISION)) throw new Error('Interest rates cannot be negative');
      netFee = preFeeCashToAccount.scale(BigNumber.from(RATE_PRECISION).sub(fee), RATE_PRECISION);
    } else {
      netFee = preFeeCashToAccount.scale(BigNumber.from(RATE_PRECISION).sub(fee), fee).neg();
    }

    const cashToReserve = netFee.scale(this.reserveFeeShare, 100);
    const netCashToAccount = preFeeCashToAccount.sub(netFee);
    const netCashToMarket = preFeeCashToAccount.sub(netFee).add(cashToReserve).neg();

    return { cashToReserve, netCashToAccount, netCashToMarket };
  }

  private iterateRates(cashAmount: TypedBigNumber, blockTime: number) {
    const { rateScalar, totalCashUnderlying, rateAnchor } = this.getExchangeRateFactors(blockTime);
    let fCashGuess = Market.fCashFromExchangeRate(rateAnchor.toNumber(), cashAmount).neg();
    const feeRate = Market.interestToExchangeRate(this.totalFee, blockTime, this.maturity);

    // Calculate derivative
    let delta = BigNumber.from(0);
    let numLoops = 0;
    do {
      const exchangeRate = this.getExchangeRate(totalCashUnderlying, rateScalar, rateAnchor, fCashGuess);
      delta = this.calculateDelta(cashAmount, rateScalar, fCashGuess, totalCashUnderlying, exchangeRate, feeRate);
      fCashGuess = TypedBigNumber.from(fCashGuess.n.sub(delta), fCashGuess.type, fCashGuess.symbol);
      if (numLoops > 200) throw Error('Rate calculation did not converge');
      numLoops += 1;
    } while (delta.abs().gt(0));

    return fCashGuess;
  }

  private calculateDelta(
    cashAmount: TypedBigNumber,
    rateScalar: BigNumber,
    fCashGuess: TypedBigNumber,
    totalCashUnderlying: TypedBigNumber,
    _exchangeRate: BigNumber,
    feeRate: number
  ) {
    let exchangeRate = _exchangeRate;
    const denominator = rateScalar
      .mul(this.market.totalfCash.sub(fCashGuess).n)
      .mul(totalCashUnderlying.add(fCashGuess).n)
      .div(RATE_PRECISION);

    let derivative: BigNumber;

    if (fCashGuess.n.gt(0)) {
      // Lending
      exchangeRate = exchangeRate.mul(RATE_PRECISION).div(feeRate);
      if (exchangeRate.lt(RATE_PRECISION)) throw new Error('Cannot lend below 0% interest');

      // (cashAmount / fee) * (totalfCash + totalCash)
      // Precision: TOKEN_PRECISION ^ 2
      derivative = cashAmount.n.mul(RATE_PRECISION).mul(this.market.totalfCash.add(totalCashUnderlying).n).div(feeRate);
    } else {
      // Borrowing
      exchangeRate = exchangeRate.mul(feeRate).div(RATE_PRECISION);
      if (exchangeRate.lt(RATE_PRECISION)) throw new Error('Cannot borrow below 0% interest');

      // (cashAmount * fee) * (totalfCash + totalCash)
      // Precision: TOKEN_PRECISION ^ 2
      derivative = cashAmount.n.mul(feeRate).mul(this.market.totalfCash.add(totalCashUnderlying).n).div(RATE_PRECISION);
    }
    // 1 - numerator / denominator
    // Precision: TOKEN_PRECISION
    derivative = BigNumber.from(INTERNAL_TOKEN_PRECISION).sub(derivative.div(denominator));

    // f(fCash) = cashAmount * exchangeRate * fee + fCash
    // NOTE: exchangeRate at this point already has the fee taken into account
    const numerator = cashAmount.n.mul(exchangeRate).div(RATE_PRECISION).add(fCashGuess.n);

    // f(fCash) / f'(fCash), note that they are both denominated as cashAmount so use TOKEN_PRECISION
    // here instead of RATE_PRECISION
    return numerator.mul(INTERNAL_TOKEN_PRECISION).div(derivative);
  }

  private static logProportion(_proportion: BigNumber) {
    if (_proportion.gte(MAX_MARKET_PROPORTION)) throw new Error('Insufficient liquidity');

    const ratio = _proportion.mul(RATE_PRECISION).div(BigNumber.from(RATE_PRECISION).sub(_proportion));
    if (ratio.lte(0)) throw new Error('Insufficient liquidity');
    const logValue = Math.log(ratio.toNumber() / RATE_PRECISION);

    return BigNumber.from(Math.trunc(logValue * RATE_PRECISION));
  }

  private timeToMaturity(blockTime: number) {
    const t = this.maturity - blockTime;
    if (t < 0) throw Error('Time to maturity cannot be in past');
    return t;
  }
}
