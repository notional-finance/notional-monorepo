import { BigNumber, BigNumberish, utils } from 'ethers';
import { ExchangeRate, TokenDefinition, TokenInterface } from '../Definitions';
import { RATE_PRECISION } from '@notional-finance/sdk/config/constants';
import { TokenRegistry } from './TokenRegistry';

export class TokenBalance {
  /** Create Methods */
  constructor(public n: BigNumber, public token: TokenDefinition) {
    if (TokenRegistry.isMaturingToken(token.tokenInterface) && !token.maturity)
      throw Error(`Maturity required for ${token.symbol}`);
  }

  static from(n: BigNumberish, token: TokenDefinition) {
    return new TokenBalance(BigNumber.from(n), token);
  }

  static zero(token: TokenDefinition) {
    return new TokenBalance(BigNumber.from(0), token);
  }

  static unit(token: TokenDefinition) {
    return new TokenBalance(BigNumber.from(10).pow(token.decimalPlaces), token);
  }

  static fromJSON(obj: TokenBalance['json']) {
    if (!obj._isTokenBalance) throw Error('Invalid JSON Token Balance');
    return TokenBalance.from(obj.hex, obj.token);
  }

  copy(n: BigNumberish = this.n) {
    return TokenBalance.from(n, this.token);
  }

  /** Attributes Methods */

  get isWETH() {
    return this.token.tokenInterface === TokenInterface.WETH;
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
        this.token.tokenInterface,
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
    } else if (this.token.tokenInterface !== m.token.tokenInterface) {
      throw TypeError(
        `Type Key [tokenStandard]: ${this.token.tokenInterface} != ${m.token.tokenInterface}`
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
   * @param abbr abbreviate to thousands (k), millions (m), billions (b)
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places
   */
  toDisplayString(decimalPlaces = 3, abbr = false, locale = 'en-US') {
    let value = this.toFloat();
    let suffix = '';

    if (abbr) {
      if (value < 1_000) {
        suffix = '';
      } else if (value < 1_000_000) {
        suffix = 'k';
        value = value / 1_000;
      } else if (value < 1_000_000_000) {
        suffix = 'm';
        value = value / 1_000_000;
      } else if (value < 1_000_000_000_000) {
        suffix = 'b';
        value = value / 1_000_000_000;
      } else {
        throw Error('Abbreviation overflow');
      }
    }

    const localeString = value.toLocaleString(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    // If the return string is -0.00 or some variant, strip the negative
    if (localeString.match(/-0\.?[0]*$/)) {
      return localeString.replace('-', '');
    }

    return `${localeString}${suffix}`;
  }

  /**
   * @param decimalPlaces maximum number of decimal places to show
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places and a symbol appended
   */
  toDisplayStringWithSymbol(decimalPlaces = 3, abbr = false, locale = 'en-US') {
    return `${this.toDisplayString(decimalPlaces, abbr, locale)} ${
      this.token.symbol
    }`;
  }

  /**
   * Converts a token to a different token
   * @param token new token definition
   * @param exchangeRate token exchange rate, will look up from oracle if defined
   * @param discount a discount or buffer scaled to a 100, used for haircuts and buffers
   * @returns a new token balance object
   */
  toToken(
    token: TokenDefinition,
    exchangeRate?: ExchangeRate,
    discount?: number
  ) {
    // TODO: do a lookup against the OracleRegistry here...
    if (!exchangeRate) throw Error('No Exchange Rate');

    const mustInvert =
      exchangeRate.quote === token.symbol &&
      exchangeRate.base === this.token.symbol;
    if (
      !mustInvert &&
      exchangeRate.base !== token.symbol &&
      exchangeRate.quote !== this.token.symbol
    ) {
      throw Error(
        `Exchange rate ${exchangeRate} does not match conversion ${this.token.symbol}/${token.symbol}`
      );
    }

    const newToken = new TokenBalance(
      (mustInvert
        ? this.divInRatePrecision(exchangeRate.rate)
        : this.mulInRatePrecision(exchangeRate.rate)
      ).scaleTo(token.decimalPlaces),
      token
    );

    return discount ? newToken.scale(discount, 100) : newToken;
  }
}
