import { BigNumber, BigNumberish, utils } from 'ethers';
import { TokenDefinition, TokenStandard } from './TokenRegistry';
import { RATE_PRECISION } from '@notional-finance/sdk/config/constants';

export class TokenBalance {
  /** Create Methods */
  constructor(
    public n: BigNumber,
    public token: TokenDefinition,
    public underlying?: TokenDefinition
  ) {}

  static from(
    n: BigNumberish,
    token: TokenDefinition,
    underlying?: TokenDefinition
  ) {
    return new TokenBalance(BigNumber.from(n), token, underlying);
  }

  static zero(token: TokenDefinition, underlying?: TokenDefinition) {
    return new TokenBalance(BigNumber.from(0), token, underlying);
  }

  static unit(token: TokenDefinition, underlying?: TokenDefinition) {
    return new TokenBalance(
      BigNumber.from(10).pow(token.decimalPlaces),
      token,
      underlying
    );
  }

  static fromJSON(obj: TokenBalance['json']) {
    if (!obj._isTokenBalance) throw Error('Invalid JSON Token Balance');
    return TokenBalance.from(obj.hex, obj.token, obj.underlying);
  }

  copy(n: BigNumberish = this.n) {
    return TokenBalance.from(n, this.token, this.underlying);
  }

  /** Attributes Methods */

  get isWETH() {
    return this.token.tokenStandard === TokenStandard.WETH;
  }

  /**
   * The token's decimals raised to a power of 10
   */
  get decimals() {
    return BigNumber.from(10).pow(this.token.decimalPlaces);
  }

  /**
   * TokenBalance objects with the same typeKey can be added together
   */
  get typeKey() {
    return utils.id(
      [
        this.token.address,
        this.token.network,
        this.token.symbol,
        this.token.decimalPlaces,
        this.token.tokenStandard,
        this.token.maturity,
      ].join(':')
    );
  }

  /**
   * TokenBalance objects with the same hash key have the same value
   */
  get hashKey() {
    return utils.id([this.typeKey, this.n.toString()].join(':'));
  }

  /**
   * Returns a JSON serializable version of the object
   */
  get json() {
    return {
      _isTokenBalance: true,
      hex: this.n.toHexString(),
      token: this.token,
      underlying: this.underlying,
    };
  }

  /** Math Methods */
  abs() {
    return this.copy(this.n.abs());
  }

  neg() {
    return this.copy(this.n.mul(-1));
  }

  add(m: TokenBalance) {
    this.isMatch(m);
    return this.copy(this.n.add(m.n));
  }

  sub(m: TokenBalance) {
    this.isMatch(m);
    return this.copy(this.n.sub(m.n));
  }

  scale(
    numerator: BigNumberish | TokenBalance,
    denominator: BigNumberish | TokenBalance
  ) {
    const num = numerator instanceof TokenBalance ? numerator.n : numerator;
    const denom =
      denominator instanceof TokenBalance ? denominator.n : denominator;

    if (
      numerator instanceof TokenBalance &&
      denominator instanceof TokenBalance
    ) {
      try {
        numerator.isMatch(numerator);
      } catch {
        this.isMatch(denominator);
      }
    }

    return this.copy(this.n.mul(num).div(denom));
  }

  /**
   * Multiplies in 1e9 rate precision
   */
  mulInRatePrecision(numerator: BigNumberish) {
    return this.scale(numerator, RATE_PRECISION);
  }

  /**
   * Divides in 1e9 rate precision
   */
  divInRatePrecision(denominator: BigNumberish) {
    return this.scale(RATE_PRECISION, denominator);
  }

  /**
   * Returns a BigNumber ratio with a corresponding token balance
   */
  ratioWith(denominator: TokenBalance) {
    return this.scale(RATE_PRECISION, denominator).n;
  }

  /**
   * Scales to a given number of decimal places
   */
  scaleTo(decimalPlaces: number) {
    return this.scale(BigNumber.from(10).pow(decimalPlaces), this.decimals).n;
  }

  /** Comparison Methods */
  isMatch(m: TokenBalance) {
    if (m.typeKey === this.typeKey) return;

    // Find the mismatched key to write the error
    if (this.token.address !== m.token.address) {
      throw TypeError(
        `Type Key [address]: ${this.token.address} != ${m.token.address}`
      );
    } else if (this.token.network !== m.token.network) {
      throw TypeError(
        `Type Key [network]: ${this.token.network} != ${m.token.network}`
      );
    } else if (this.token.symbol !== m.token.symbol) {
      throw TypeError(
        `Type Key [symbol]: ${this.token.symbol} != ${m.token.symbol}`
      );
    } else if (this.token.decimalPlaces !== m.token.decimalPlaces) {
      throw TypeError(
        `Type Key [decimalPlaces]: ${this.token.decimalPlaces} != ${m.token.decimalPlaces}`
      );
    } else if (this.token.tokenStandard !== m.token.tokenStandard) {
      throw TypeError(
        `Type Key [tokenStandard]: ${this.token.tokenStandard} != ${m.token.tokenStandard}`
      );
    } else if (this.token.maturity !== m.token.maturity) {
      throw TypeError(
        `Type Key [maturity]: ${this.token.maturity} != ${m.token.maturity}`
      );
    } else {
      throw TypeError(`Type Key [unknown]`);
    }
  }

  eq(m: TokenBalance) {
    this.isMatch(m);
    return this.n.eq(m.n);
  }

  lt(m: TokenBalance) {
    this.isMatch(m);
    return this.n.lt(m.n);
  }

  lte(m: TokenBalance) {
    this.isMatch(m);
    return this.n.lte(m.n);
  }

  gt(m: TokenBalance) {
    this.isMatch(m);
    return this.n.gt(m.n);
  }

  gte(m: TokenBalance) {
    this.isMatch(m);
    return this.n.gte(m.n);
  }

  isNegative(): boolean {
    return this.n.isNegative();
  }

  isPositive(): boolean {
    return this.n.gt(0);
  }

  isZero(): boolean {
    return this.n.isZero();
  }

  /** Formatting Methods */

  /**
   * @returns a javascript number, may throw an error on overflows
   */
  toNumber() {
    return this.n.toNumber();
  }

  /**
   * @returns a hex string representation of the number
   */
  toHexString() {
    return this.n.toHexString();
  }

  /**
   * @returns an integer as an unformatted string
   */
  toString() {
    return this.n.toString();
  }

  /**
   * @returns floating point number based on the decimal places of this number
   */
  toFloat() {
    return parseFloat(this.toExactString());
  }

  /**
   * @returns a string representation of the decimal number number
   */
  toExactString() {
    return utils.formatUnits(this.n, this.token.decimalPlaces);
  }

  /**
   * @param decimalPlaces maximum number of decimal places to show
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places
   */
  toDisplayString(decimalPlaces = 3, locale = 'en-US') {
    const localeString = this.toFloat().toLocaleString(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    // If the return string is -0.00 or some variant, strip the negative
    if (localeString.match(/-0\.?[0]*$/)) {
      return localeString.replace('-', '');
    }

    return localeString;
  }

  /**
   * @param decimalPlaces maximum number of decimal places to show
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places and a symbol appended
   */
  toDisplayStringWithSymbol(decimalPlaces = 3, locale = 'en-US') {
    return `${this.toDisplayString(decimalPlaces, locale)} ${
      this.token.symbol
    }`;
  }

  /** Conversion Methods */

  // toToken()
  // toUnderlying()
}
