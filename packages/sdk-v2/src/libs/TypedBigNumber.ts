import { BigNumber, BigNumberish, constants, ethers, utils } from 'ethers';
import { TokenType } from './types';
import {
  INTERNAL_TOKEN_PRECISION,
  PERCENTAGE_BASIS,
  INTERNAL_TOKEN_DECIMAL_PLACES,
  NOTE_CURRENCY_ID,
  STAKED_NOTE_CURRENCY_ID,
} from '../config/constants';
import { System, NTokenValue } from '../system';

export enum BigNumberType {
  ExternalUnderlying = 'External Underlying',
  InternalUnderlying = 'Internal Underlying',
  ExternalAsset = 'External Asset',
  InternalAsset = 'Internal Asset',
  LiquidityToken = 'Liquidity Token',
  nToken = 'nToken',
  NOTE = 'NOTE',
  sNOTE = 'Staked NOTE',
  sNOTEInternal = 'Staked NOTE (Internal)',
  Currency = 'Currency',
  VaultShare = 'VaultShare',
  StrategyToken = 'StrategyToken',
  DebtShare = 'DebtShare',
}

class TypedBigNumber {
  get currencyId() {
    if (this.symbol === 'NOTE') {
      return NOTE_CURRENCY_ID;
    }
    if (this.symbol === 'sNOTE') {
      return STAKED_NOTE_CURRENCY_ID;
    }
    if (this.symbol === 'WETH') {
      return 1;
    }
    return System.getSystem().getCurrencyBySymbol(this.symbol).id;
  }

  private _isWETH = false;

  /**
   * WETH is handled as ETH for all internal calculations but we flag it here for other
   * methods to differentiate.
   */
  get isWETH() {
    return this._isWETH;
  }

  get decimals() {
    // Decimals override allows us to load custom tokens that are not in the
    // "System" object. These cannot access the fromETH / toETH methods but
    // we can still convert between internal and external precision as well as
    // do all the formatting methods.
    if (this._decimalsOverride) return BigNumber.from(10).pow(this._decimalsOverride);
    if (this.currencyId === STAKED_NOTE_CURRENCY_ID) return ethers.constants.WeiPerEther;
    if (this.currencyId === NOTE_CURRENCY_ID) return BigNumber.from(INTERNAL_TOKEN_PRECISION);

    const currency = System.getSystem().getCurrencyById(this.currencyId);
    const decimals = this.isUnderlying()
      ? currency.underlyingDecimals || currency.assetDecimals
      : currency.assetDecimals;
    if (!decimals) throw new Error(`Decimals not found for currency ${this.currencyId}`);
    return decimals;
  }

  get hashKey() {
    return utils.id([this.type, this.n.toString(), this._isWETH, this.symbol].join(':'));
  }

  private constructor(
    public n: BigNumber,
    public type: BigNumberType,
    public symbol: string,
    private _decimalsOverride?: number
  ) {
    if (symbol === 'WETH') {
      this.symbol = 'ETH';
      // Mark the currency as WETH even though we treat it as ETH for calculations
      this._isWETH = true;
    }
  }

  static getZeroUnderlying(currencyId: number) {
    const system = System.getSystem();
    const underlyingSymbol = system.getUnderlyingSymbol(currencyId);
    return new TypedBigNumber(BigNumber.from(0), BigNumberType.InternalUnderlying, underlyingSymbol);
  }

  static getType(symbol: string, isInternal: boolean) {
    if (symbol === 'NOTE') {
      return BigNumberType.NOTE;
    }
    if (symbol === 'sNOTE') {
      return BigNumberType.sNOTE;
    }
    if (symbol === 'WETH') {
      // Rewrite WETH to ETH for purposes of getting the type
      // eslint-disable-next-line no-param-reassign
      symbol = 'ETH';
    }

    const currency = System.getSystem().getCurrencyBySymbol(symbol);
    if (symbol === currency.underlyingSymbol) {
      return isInternal ? BigNumberType.InternalUnderlying : BigNumberType.ExternalUnderlying;
    }
    if (symbol === currency.assetSymbol) {
      return isInternal ? BigNumberType.InternalAsset : BigNumberType.ExternalAsset;
    }
    if (symbol === currency.nTokenSymbol) {
      return BigNumberType.nToken;
    }
    throw Error(`Invalid symbol ${symbol}`);
  }

  static encodeJSON(value: any, type: BigNumberType, symbol: string) {
    return {
      _isTypedBigNumber: true,
      hex: BigNumber.from(value).toHexString(),
      bigNumberType: type,
      symbol,
    };
  }

  static fromBalance(value: any, symbol: string, isInternal: boolean) {
    const bnType = TypedBigNumber.getType(symbol, isInternal);
    return new TypedBigNumber(BigNumber.from(value), bnType, symbol);
  }

  static from(value: any, type: BigNumberType, symbol: string, decimalsOverride?: number) {
    // eslint-disable-next-line no-underscore-dangle
    if (value._isBigNumber) return new TypedBigNumber(value, type, symbol, decimalsOverride);
    return new TypedBigNumber(BigNumber.from(value), type, symbol, decimalsOverride);
  }

  static fromObject(value: { hex: string; bigNumberType: BigNumberType; symbol: string; decimals?: number }) {
    return new TypedBigNumber(BigNumber.from(value.hex), value.bigNumberType, value.symbol, value.decimals);
  }

  static max(a: TypedBigNumber, b: TypedBigNumber): TypedBigNumber {
    a.checkMatch(b);
    return a.gte(b) ? a : b;
  }

  static min(a: TypedBigNumber, b: TypedBigNumber): TypedBigNumber {
    a.checkMatch(b);
    return a.lte(b) ? a : b;
  }

  checkType(type: BigNumberType) {
    if (this.type !== type) throw TypeError(`Invalid TypedBigNumber type ${this.type} != ${type}`);
  }

  check(type: BigNumberType, symbol: string | undefined) {
    if (this.type !== type) throw TypeError(`Invalid TypedBigNumber type ${this.type} != ${type}`);
    if (this.symbol !== symbol) throw TypeError(`Invalid TypedBigNumber currency ${this.symbol} != ${symbol}`);
  }

  checkMatch(other: TypedBigNumber) {
    if (other.type !== this.type) throw TypeError(`Unmatched BigNumber types ${this.type} != ${other.type}`);
    if (this.symbol && this.symbol !== other.symbol) {
      throw TypeError(`Unmatched currency types ${this.symbol} != ${other.symbol}`);
    }
  }

  copy(n: BigNumberish = this.n) {
    return new TypedBigNumber(BigNumber.from(n), this.type, this.symbol, this._decimalsOverride);
  }

  abs(): TypedBigNumber {
    return this.copy(this.n.abs());
  }

  add(other: TypedBigNumber): TypedBigNumber {
    this.checkMatch(other);
    return this.copy(this.n.add(other.n));
  }

  sub(other: TypedBigNumber): TypedBigNumber {
    this.checkMatch(other);
    return this.copy(this.n.sub(other.n));
  }

  scale(numerator: BigNumberish | TypedBigNumber, divisor: BigNumberish | TypedBigNumber): TypedBigNumber {
    const num = numerator instanceof TypedBigNumber ? numerator.n : numerator;
    const denom = divisor instanceof TypedBigNumber ? divisor.n : divisor;

    if (numerator instanceof TypedBigNumber && divisor instanceof TypedBigNumber) {
      try {
        numerator.checkMatch(divisor);
      } catch {
        this.checkMatch(divisor);
      }
    }

    return this.copy(this.n.mul(num).div(denom));
  }

  neg(): TypedBigNumber {
    return this.copy(this.n.mul(-1));
  }

  eq(other: TypedBigNumber): boolean {
    this.checkMatch(other);
    return this.n.eq(other.n);
  }

  lt(other: TypedBigNumber): boolean {
    this.checkMatch(other);
    return this.n.lt(other.n);
  }

  lte(other: TypedBigNumber): boolean {
    this.checkMatch(other);
    return this.n.lte(other.n);
  }

  gt(other: TypedBigNumber): boolean {
    this.checkMatch(other);
    return this.n.gt(other.n);
  }

  gte(other: TypedBigNumber): boolean {
    this.checkMatch(other);
    return this.n.gte(other.n);
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

  toNumber(): number {
    return this.n.toNumber();
  }

  toBigInt(): bigint {
    return this.n.toBigInt();
  }

  toString(): string {
    return this.n.toString();
  }

  toHexString(): string {
    return this.n.toHexString();
  }

  isAssetCash(): boolean {
    return this.type === BigNumberType.InternalAsset || this.type === BigNumberType.ExternalAsset;
  }

  isUnderlying(): boolean {
    return this.type === BigNumberType.InternalUnderlying || this.type === BigNumberType.ExternalUnderlying;
  }

  isNToken(): boolean {
    return this.type === BigNumberType.nToken;
  }

  isNonMintable(): boolean {
    const currency = System.getSystem().getCurrencyById(this.currencyId);
    return currency.tokenType === TokenType.NonMintable;
  }

  isNOTE(): boolean {
    return this.type === BigNumberType.NOTE;
  }

  isStakedNOTE(): boolean {
    return this.type === BigNumberType.sNOTE;
  }

  isInternalPrecision(): boolean {
    return (
      this.type === BigNumberType.InternalUnderlying ||
      this.type === BigNumberType.InternalAsset ||
      this.type === BigNumberType.LiquidityToken ||
      this.type === BigNumberType.NOTE ||
      this.type === BigNumberType.sNOTEInternal ||
      this.type === BigNumberType.nToken ||
      this.type === BigNumberType.Currency ||
      this.type === BigNumberType.VaultShare ||
      this.type === BigNumberType.StrategyToken ||
      this.type === BigNumberType.DebtShare
    );
  }

  isExternalPrecision(): boolean {
    return !this.isInternalPrecision();
  }

  toExactString(): string {
    let decimalPlaces: number;
    if (this.isInternalPrecision()) {
      return utils.formatUnits(this.n, INTERNAL_TOKEN_DECIMAL_PLACES);
    }

    if (this.isStakedNOTE()) {
      decimalPlaces = 18;
    } else {
      const currency = System.getSystem().getCurrencyBySymbol(this.symbol);
      decimalPlaces = this.isUnderlying() ? currency.underlyingDecimalPlaces! : currency.assetDecimalPlaces;
    }

    return utils.formatUnits(this.n, decimalPlaces);
  }

  toFloat(): number {
    return parseFloat(this.toExactString());
  }

  toDisplayStringWithfCashSymbol(decimalPlaces = 3, locale = 'en-US'): string {
    this.checkType(BigNumberType.InternalUnderlying);
    return `${this.toDisplayString(decimalPlaces, locale)} f${this.symbol}`;
  }

  toDisplayStringWithSymbol(decimalPlaces = 3, locale = 'en-US'): string {
    return `${this.toDisplayString(decimalPlaces, locale)} ${this.symbol}`;
  }

  toDisplayString(decimalPlaces = 3, locale = 'en-US'): string {
    const exactString = this.toExactString();
    const displayString = parseFloat(exactString).toLocaleString(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    // If the return string is -0.00 or some variant, strip the negative
    if (displayString.match(/-0\.?[0]*$/)) {
      return displayString.replace('-', '');
    }

    return displayString;
  }

  toAssetCash(internalPrecision: boolean = this.isInternalPrecision(), overrideRate?: BigNumber): TypedBigNumber {
    if (this.isAssetCash()) {
      return internalPrecision ? this.toInternalPrecision() : this.toExternalPrecision();
    }
    if (this.isNonMintable()) {
      // A non mintable token does not require currency conversion
      const matchingPrecision = internalPrecision ? this.toInternalPrecision() : this.toExternalPrecision();
      const bnType = internalPrecision ? BigNumberType.InternalAsset : BigNumberType.ExternalAsset;
      return new TypedBigNumber(matchingPrecision.n, bnType, this.symbol);
    }
    if (this.isUnderlying()) {
      const { underlyingDecimalPlaces, assetRate: fetchedRate } = System.getSystem().getAssetRate(this.currencyId);
      const assetRate = overrideRate || fetchedRate;
      if (!underlyingDecimalPlaces || !assetRate) throw Error(`Asset rate for ${this.currencyId} not found`);

      const underlyingDecimals = BigNumber.from(10).pow(underlyingDecimalPlaces);
      const currency = System.getSystem().getCurrencyById(this.currencyId);

      if (this.isInternalPrecision()) {
        // rateDecimals * balance * underlyingPrecision / assetRate * internalPrecision
        const assetValue = this.n
          .mul(constants.WeiPerEther as BigNumber)
          .mul(underlyingDecimals)
          .div(assetRate)
          .div(INTERNAL_TOKEN_PRECISION);

        const bn = new TypedBigNumber(assetValue, BigNumberType.InternalAsset, currency.assetSymbol);
        return internalPrecision ? bn : bn.toExternalPrecision();
      }
      // rateDecimals * balance / assetRate
      const assetValue = this.n.mul(constants.WeiPerEther as BigNumber).div(assetRate);

      const bn = new TypedBigNumber(assetValue, BigNumberType.ExternalAsset, currency.assetSymbol);
      // Convert to internal precision if required by parameter
      return internalPrecision ? bn.toInternalPrecision() : bn;
    }
    if (this.isNToken()) {
      // This returns the nToken balance in asset cash value (does not include redeem slippage)
      const assetValue = NTokenValue.convertNTokenToInternalAsset(this.currencyId, this, false);
      return internalPrecision ? assetValue : assetValue.toExternalPrecision();
    }

    throw Error(`Cannot convert ${this.type} to asset cash directly`);
  }

  toUnderlying(internalPrecision: boolean = this.isInternalPrecision(), overrideRate?: BigNumber): TypedBigNumber {
    if (this.isNOTE()) {
      // NOTE does not convert to underlying, just returns itself
      return this;
    }
    if (this.isUnderlying() || this.isStakedNOTE()) {
      return internalPrecision ? this.toInternalPrecision() : this.toExternalPrecision();
    }
    if (this.isNonMintable()) {
      // A non mintable token does not require currency conversion
      const matchingPrecision = internalPrecision ? this.toInternalPrecision() : this.toExternalPrecision();
      const bnType = internalPrecision ? BigNumberType.InternalUnderlying : BigNumberType.ExternalUnderlying;
      return new TypedBigNumber(matchingPrecision.n, bnType, this.symbol);
    }
    if (this.isAssetCash()) {
      const { underlyingDecimalPlaces, assetRate: fetchedRate } = System.getSystem().getAssetRate(this.currencyId);
      const assetRate = overrideRate || fetchedRate;
      if (!underlyingDecimalPlaces || !assetRate) throw Error(`Asset rate for ${this.currencyId} not found`);

      const underlyingDecimals = BigNumber.from(10).pow(underlyingDecimalPlaces);
      const underlyingSymbol = System.getSystem().getUnderlyingSymbol(this.currencyId);

      if (this.isInternalPrecision()) {
        // (balance * assetRate * internalPrecision) / (assetRateDecimals * underlyingPrecision)
        const underlying = this.n
          .mul(assetRate)
          .mul(INTERNAL_TOKEN_PRECISION)
          .div(constants.WeiPerEther as BigNumber)
          .div(underlyingDecimals);

        const bn = new TypedBigNumber(underlying, BigNumberType.InternalUnderlying, underlyingSymbol);
        // Convert to external precision if required by parameter
        return internalPrecision ? bn : bn.toExternalPrecision();
      }
      // (balance * assetRate) / (assetRateDecimals)
      const underlying = this.n.mul(assetRate).div(constants.WeiPerEther as BigNumber);

      const bn = new TypedBigNumber(underlying, BigNumberType.ExternalUnderlying, underlyingSymbol);
      // Convert to internal precision if required by parameter
      return internalPrecision ? bn.toInternalPrecision() : bn;
    }
    if (this.isNToken()) {
      // This returns the nToken balance in underlying value (does not include redeem slippage)
      return NTokenValue.convertNTokenToInternalAsset(this.currencyId, this, false).toUnderlying(internalPrecision);
    }

    throw Error(`Cannot convert ${this.type} to underlying directly`);
  }

  toInternalPrecision(): TypedBigNumber {
    if (this.isInternalPrecision()) return this;

    let newType: BigNumberType;
    if (this.type === BigNumberType.ExternalAsset) {
      newType = BigNumberType.InternalAsset;
    } else if (this.type === BigNumberType.ExternalUnderlying) {
      newType = BigNumberType.InternalUnderlying;
    } else if (this.type === BigNumberType.sNOTE) {
      newType = BigNumberType.sNOTEInternal;
    } else {
      throw TypeError('Unknown external precision type');
    }

    return new TypedBigNumber(
      this.n.mul(INTERNAL_TOKEN_PRECISION).div(this.decimals),
      newType,
      this.symbol,
      this._decimalsOverride
    );
  }

  toExternalPrecision(): TypedBigNumber {
    if (this.isExternalPrecision()) return this;
    if (
      this.type === BigNumberType.LiquidityToken ||
      this.type === BigNumberType.NOTE ||
      this.type === BigNumberType.nToken
    )
      return this;

    let newType: BigNumberType;
    if (this.type === BigNumberType.InternalAsset) {
      newType = BigNumberType.ExternalAsset;
    } else if (this.type === BigNumberType.InternalUnderlying) {
      newType = BigNumberType.ExternalUnderlying;
    } else {
      throw TypeError('Unknown external precision type');
    }

    return new TypedBigNumber(
      this.n.mul(this.decimals).div(INTERNAL_TOKEN_PRECISION),
      newType,
      this.symbol,
      this._decimalsOverride
    );
  }

  toETH(useHaircut: boolean) {
    const { haircut, buffer, latestRate, rateDecimalPlaces } = System.getSystem().getETHRate(this.currencyId);
    if (!(this.isAssetCash() || this.isUnderlying() || this.isNOTE())) {
      throw new Error(`Cannot convert ${this.type} directly to ETH`);
    }

    let multiplier = PERCENTAGE_BASIS;
    if (useHaircut) {
      if (this.isNOTE()) throw new Error('No haircut and buffer for NOTE');
      multiplier = this.isPositive() ? haircut : buffer;
    }

    const underlyingValue = this.toUnderlying(this.isInternalPrecision()).n;
    const eth = underlyingValue
      .mul(latestRate)
      .mul(multiplier)
      .div(PERCENTAGE_BASIS)
      .div(BigNumber.from(10).pow(rateDecimalPlaces));

    const bnType = this.isInternalPrecision() ? BigNumberType.InternalUnderlying : BigNumberType.ExternalUnderlying;
    return TypedBigNumber.from(eth, bnType, 'ETH');
  }

  fromETH(currencyId: number, useHaircut = false) {
    // Must be internal underlying, ETH
    // eslint-disable-next-line
    const _this = this.toInternalPrecision();
    _this.check(BigNumberType.InternalUnderlying, 'ETH');
    const { haircut, buffer, rateDecimalPlaces, latestRate } = System.getSystem().getETHRate(currencyId);
    // eslint-disable-next-line
    const underlyingSymbol =
      currencyId === NOTE_CURRENCY_ID ? 'NOTE' : System.getSystem().getUnderlyingSymbol(currencyId);

    let multiplier = PERCENTAGE_BASIS;
    if (useHaircut) {
      multiplier = _this.isPositive() ? haircut : buffer;
    }

    const internalUnderlying = _this.n
      .mul(BigNumber.from(10).pow(rateDecimalPlaces))
      .mul(PERCENTAGE_BASIS)
      .div(latestRate)
      .div(multiplier);

    const bnType = underlyingSymbol === 'NOTE' ? BigNumberType.NOTE : BigNumberType.InternalUnderlying;
    return TypedBigNumber.from(internalUnderlying, bnType, underlyingSymbol);
  }

  toUSD() {
    // Converts value to USD using the USDC conversion rate
    const internalUnderlying = this.toUnderlying(true);
    const usdRate = System.getSystem().getUSDRate(this.symbol);
    return new TypedBigNumber(
      internalUnderlying.scale(ethers.constants.WeiPerEther, usdRate).n,
      BigNumberType.Currency,
      'USD'
    );
  }

  toCUR(symbol: string) {
    const usdValue = this.toUSD();
    if (symbol === 'USD') return usdValue;
    const usdRate = System.getSystem().getUSDRate(symbol);
    return new TypedBigNumber(usdValue.scale(usdRate, ethers.constants.WeiPerEther).n, BigNumberType.Currency, symbol);
  }

  toJSON(_?: string): any {
    return {
      _isTypedBigNumber: true,
      hex: this.toHexString(),
      bigNumberType: this.type,
      symbol: this.isWETH ? 'WETH' : this.symbol,
      decimals: this._decimalsOverride,
    };
  }
}

export default TypedBigNumber;
