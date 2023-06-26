import {
  ALT_ETH,
  AssetType,
  convertToGenericfCashId,
  encodeERC1155Id,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SCALAR_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { Registry, ExchangeRate, TokenDefinition, RiskAdjustment } from '.';

export type SerializedTokenBalance = ReturnType<TokenBalance['toJSON']>;

export class TokenBalance {
  /** Create Methods */
  constructor(
    public n: BigNumber,
    public tokenId: string,
    public network: Network
  ) {
    this.tokenId = convertToGenericfCashId(tokenId);
    // Rewrite alt eth address to zero address
    if (this.tokenId === ALT_ETH) this.tokenId = ZERO_ADDRESS;
  }

  static fromFloat(n: number | string, token: TokenDefinition) {
    const bn = parseUnits(n.toString(), token.decimals);
    return new TokenBalance(bn, token.id, token.network);
  }

  static from(n: BigNumberish, token: TokenDefinition) {
    return new TokenBalance(BigNumber.from(n), token.id, token.network);
  }

  static fromID(n: BigNumberish, id: string, network: Network) {
    const token = Registry.getTokenRegistry().getTokenByID(network, id);
    return new TokenBalance(BigNumber.from(n), token.id, token.network);
  }

  static fromSymbol(n: BigNumberish, symbol: string, network: Network) {
    const token = Registry.getTokenRegistry().getTokenBySymbol(network, symbol);
    return new TokenBalance(BigNumber.from(n), token.id, token.network);
  }

  static zero(token: TokenDefinition) {
    return new TokenBalance(BigNumber.from(0), token.id, token.network);
  }

  static unit(token: TokenDefinition) {
    return new TokenBalance(
      BigNumber.from(10).pow(token.decimals),
      token.id,
      token.network
    );
  }

  static fromJSON(obj: SerializedTokenBalance) {
    if (!obj._isTokenBalance) throw Error('Invalid JSON Token Balance');
    return new TokenBalance(BigNumber.from(obj.hex), obj.tokenId, obj.network);
  }

  /** Creates a serialized JSON token balance */
  static toJSON(
    n: BigNumber,
    tokenId: string,
    network: Network
  ): SerializedTokenBalance {
    return {
      _isTokenBalance: true,
      hex: n.toHexString(),
      tokenId,
      network,
    };
  }

  get isVaultToken() {
    return (
      this.token.vaultAddress !== undefined &&
      this.token.vaultAddress !== ZERO_ADDRESS
    );
  }

  get currencyId() {
    const id = this.token.currencyId;
    if (!id) throw Error('Currency ID undefined');
    return id;
  }

  get vaultAddress() {
    const v = this.token.vaultAddress;
    if (!v || v === ZERO_ADDRESS) throw Error('Invalid vault address');
    return v;
  }

  get maturity() {
    const m = this.token.maturity;
    if (!m) throw Error('Invalid maturity');
    return m;
  }

  get symbol() {
    return this.token.symbol;
  }

  get tokenType() {
    return this.token.tokenType;
  }

  get token() {
    return Registry.getTokenRegistry().getTokenByID(this.network, this.tokenId);
  }

  copy(n: BigNumberish = this.n) {
    return TokenBalance.from(n, this.token);
  }

  /** The token's decimals raised to a power of 10 */
  get precision() {
    return BigNumber.from(10).pow(this.token.decimals);
  }

  get decimals() {
    return this.token.decimals;
  }

  /** TokenBalance objects with the same typeKey can be added together */
  get typeKey() {
    return utils.id([this.token.id, this.token.network].join(':'));
  }

  /** TokenBalance objects with the same hash key have the same value */
  get hashKey() {
    return utils.id([this.typeKey, this.n.toString()].join(':'));
  }

  get underlying() {
    if (this.tokenType == 'Underlying') return this.token;
    if (!this.token.underlying)
      throw Error(`No underlying defined for ${this.token.symbol}`);
    return Registry.getTokenRegistry().getTokenByID(
      this.token.network,
      this.token.underlying
    );
  }

  /** Returns a JSON serializable version of the object */
  toJSON() {
    return {
      _isTokenBalance: true,
      hex: this.n.toHexString(),
      tokenId: this.tokenId,
      network: this.network,
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

  /** Multiplies in 1e9 rate precision */
  mulInRatePrecision(numerator: BigNumberish) {
    return this.scale(numerator, RATE_PRECISION);
  }

  /** Divides in 1e9 rate precision */
  divInRatePrecision(denominator: BigNumberish) {
    return this.scale(RATE_PRECISION, denominator);
  }

  /** Returns a BigNumber ratio with a corresponding token balance */
  ratioWith(denominator: TokenBalance) {
    return this.scale(RATE_PRECISION, denominator).n;
  }

  /** Scales to a given number of decimal places */
  scaleTo(decimalPlaces: number) {
    return this.scale(BigNumber.from(10).pow(decimalPlaces), this.precision).n;
  }

  scaleFromInternal() {
    return this.scale(this.precision, INTERNAL_TOKEN_DECIMALS);
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
    } else if (this.token.decimals !== m.token.decimals) {
      throw TypeError(
        `Type Key [decimalPlaces]: ${this.token.decimals} != ${m.token.decimals}`
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
    return this.toDisplayStringWithSymbol(8);
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
    return utils.formatUnits(this.n, this.token.decimals);
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
    riskAdjustment: RiskAdjustment = 'None',
    exchangeRate?: ExchangeRate | null
  ) {
    if (!exchangeRate) {
      const oracleRegistry = Registry.getOracleRegistry();
      // Fetch the latest exchange rate
      // TODO: if doing settlement then then token id needs to be the actual fCash (not generic fcash id)
      const path = oracleRegistry.findPath(
        this.unwrapVaultToken().token.id,
        token.id,
        this.token.network
      );
      exchangeRate = oracleRegistry.getLatestFromPath(
        this.token.network,
        path,
        riskAdjustment
      );
    }

    if (!exchangeRate) throw Error('No Exchange Rate');
    return new TokenBalance(
      // All exchange rates from the registry are in scalar precision
      this.scale(exchangeRate.rate, SCALAR_PRECISION).scaleTo(token.decimals),
      token.id,
      token.network
    );
  }

  toUnderlying() {
    if (this.tokenType === 'Underlying') return this;
    // Does the exchange rate conversion and decimal scaling
    return this.toToken(this.underlying);
  }

  toPrimeCash() {
    if (this.tokenType === 'PrimeCash') return this;
    const primeCash = Registry.getTokenRegistry().getPrimeCash(
      this.network,
      this.currencyId
    );

    // Does the exchange rate conversion and decimal scaling
    return this.toToken(primeCash);
  }

  toRiskAdjustedUnderlying() {
    return this.toToken(
      this.underlying,
      this.n.isNegative() ? 'Debt' : 'Asset'
    );
  }

  /** Does some token id manipulation for exchange rates */
  unwrapVaultToken() {
    if (
      this.tokenType === 'VaultDebt' &&
      this.token.maturity &&
      this.token.maturity !== PRIME_CASH_VAULT_MATURITY
    ) {
      const fCashToken = Registry.getTokenRegistry().getTokenByID(
        this.network,
        encodeERC1155Id(
          this.currencyId,
          this.token.maturity,
          AssetType.FCASH_ASSET_TYPE
        )
      );
      return TokenBalance.from(this.n, fCashToken);
    } else if (
      this.tokenType === 'VaultDebt' &&
      this.token.maturity === PRIME_CASH_VAULT_MATURITY
    ) {
      const pDebtToken = Registry.getTokenRegistry().getPrimeDebt(
        this.network,
        this.currencyId
      );
      return TokenBalance.from(this.n, pDebtToken);
    } else if (this.tokenType === 'VaultCash') {
      const pCashToken = Registry.getTokenRegistry().getPrimeDebt(
        this.network,
        this.currencyId
      );
      return TokenBalance.from(this.n, pCashToken);
    } else {
      return this;
    }
  }
}
