import {
  ALT_ETH,
  AssetType,
  convertToGenericfCashId,
  encodeERC1155Id,
  getNowSeconds,
  containsNonZeroNumber,
  INTERNAL_TOKEN_PRECISION,
  Network,
  RATE_PRECISION,
  SCALAR_PRECISION,
  ZERO_ADDRESS,
  decodeERC1155Id,
  isERC1155Id,
} from '@notional-finance/util';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { TokenDefinition, RiskAdjustment, getNetworkModel } from '.';
import { FiatKeys, FiatSymbols } from './config/fiat-config';

// NOTE: this is a hack used to hide the circular type reference for TokenBalance from typescript
const NetworkModelRegistry = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  models: new Map<Network, any>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setModel(network: Network, model: any) {
    if (!this.models.has(network)) this.models.set(network, model);
  },
  getModel(network: Network) {
    if (!this.models.has(network))
      throw new Error(`${network} is not supported`);
    return this.models.get(network);
  },
};

export function initializeTokenBalanceRegistry() {
  NetworkModelRegistry.setModel(
    Network.mainnet,
    getNetworkModel(Network.mainnet)
  );
  NetworkModelRegistry.setModel(
    Network.arbitrum,
    getNetworkModel(Network.arbitrum)
  );
  NetworkModelRegistry.setModel(Network.all, getNetworkModel(Network.all));

  return [
    getNetworkModel(Network.mainnet),
    getNetworkModel(Network.arbitrum),
    getNetworkModel(Network.all),
  ];
}

export type SerializedTokenBalance = ReturnType<TokenBalance['toJSON']>;

export class TokenBalance {
  public n: BigNumber;

  /** Create Methods */
  constructor(
    _n: BigNumberish,
    public tokenId: string,
    public network: Network
  ) {
    if (_n instanceof BigNumber) {
      this.n = _n;
    } else {
      this.n = BigNumber.from(_n);
    }

    if (isERC1155Id(tokenId)) {
      const { isfCashDebt, assetType } = decodeERC1155Id(tokenId);
      // Ensure that fcash debts and vault debts are negative
      if (
        (isfCashDebt || assetType === AssetType.VAULT_DEBT_ASSET_TYPE) &&
        this.n.gt(0)
      )
        this.n = this.n.mul(-1);
      this.tokenId = convertToGenericfCashId(tokenId).toLowerCase();
    }

    // Rewrite alt eth address to zero address
    if (this.tokenId === ALT_ETH) this.tokenId = ZERO_ADDRESS;
  }

  static fromFloat(n: number | string, token: TokenDefinition) {
    const truncatedN = Number(n).toFixed(token.decimals);
    const bn = parseUnits(truncatedN, token.decimals);
    return new TokenBalance(bn, token.id, token.network);
  }

  static from(n: BigNumberish, token: TokenDefinition) {
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

  get hasMatured() {
    return this.token.maturity && this.token.maturity < getNowSeconds();
  }

  get symbol() {
    return this.token.symbol;
  }

  get tokenType() {
    return this.token.tokenType;
  }

  get token(): TokenDefinition {
    return NetworkModelRegistry.getModel(this.network).getTokenByID(
      this.tokenId
    );
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

  get underlying(): TokenDefinition {
    if (this.tokenType == 'Underlying') return this.token;
    if (!this.token.underlying)
      throw Error(`No underlying defined for ${this.token.symbol}`);
    return NetworkModelRegistry.getModel(this.network).getTokenByID(
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

  /** Returns a BigNumber ratio in RATE_PRECISION */
  ratioWith(denominator: TokenBalance) {
    return this.scale(RATE_PRECISION, denominator).n;
  }

  /** Scales to a given number of decimal places */
  scaleTo(decimalPlaces: number) {
    return this.scale(BigNumber.from(10).pow(decimalPlaces), this.precision).n;
  }

  scaleFromInternal() {
    return this.scale(this.precision, INTERNAL_TOKEN_PRECISION);
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

  abbr(useThousandsAbbr = true) {
    const value = this.toFloat();
    if (Math.abs(value) < 1_000) {
      return { suffix: '', value };
    } else if (Math.abs(value) < 1_000_000) {
      return useThousandsAbbr
        ? { suffix: 'k', value: value / 1_000 }
        : { suffix: '', value };
    } else if (Math.abs(value) < 1_000_000_000) {
      return { suffix: 'm', value: value / 1_000_000 };
    } else if (Math.abs(value) < 1_000_000_000_000) {
      return { suffix: 'b', value: value / 1_000_000_000 };
    }

    return { suffix: '', value };
  }

  /**
   * @param decimalPlaces maximum number of decimal places to show
   * @param abbr abbreviate to thousands (k), millions (m), billions (b)
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places
   */
  toDisplayString(
    decimalPlaces?: number,
    abbr = true,
    useThousandsAbbr = true,
    locale = 'en-US'
  ) {
    let value = this.toFloat();
    let suffix = '';
    if (decimalPlaces === undefined) {
      decimalPlaces = this.tokenType === 'Fiat' ? 2 : 4;
    }

    if (abbr) {
      ({ value, suffix } = this.abbr(useThousandsAbbr));
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

  get fiatSymbol() {
    return this.tokenType === 'Fiat'
      ? FiatSymbols[this.token.symbol as FiatKeys]
      : '';
  }

  /**
   * @param decimalPlaces maximum number of decimal places to show
   * @param locale formatting locale
   * @returns a string with the specified number of decimal places and a symbol appended
   */
  toDisplayStringWithSymbol(
    decimalPlaces?: number,
    abbr = true,
    useThousandsAbbr = true,
    locale = 'en-US',
    hideSmallNegativeValues = false
  ) {
    if (this.tokenType === 'Fiat' && this.symbol !== 'NOTE') {
      if (
        this.isNegative() &&
        hideSmallNegativeValues &&
        !containsNonZeroNumber(
          this.abs().toDisplayString(
            decimalPlaces === undefined ? 2 : decimalPlaces,
            abbr,
            useThousandsAbbr,
            locale
          )
        )
      ) {
        return `${
          FiatSymbols[this.token.symbol as FiatKeys]
        }${this.abs().toDisplayString(
          decimalPlaces === undefined ? 2 : decimalPlaces,
          abbr,
          useThousandsAbbr,
          locale
        )}`;
      } else {
        return `${this.isNegative() ? '-' : ''}${
          FiatSymbols[this.token.symbol as FiatKeys]
        }${this.abs().toDisplayString(
          decimalPlaces === undefined ? 2 : decimalPlaces,
          abbr,
          useThousandsAbbr,
          locale
        )}`;
      }
    } else {
      return `${this.toDisplayString(
        decimalPlaces === undefined ? 4 : decimalPlaces,
        abbr,
        useThousandsAbbr,
        locale
      )} ${this.token.symbol}`;
    }
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
    timestamp?: number
  ): TokenBalance {
    const model = NetworkModelRegistry.getModel(this.network);

    if (this.tokenType === 'NOTE' && this.network !== Network.all) {
      // If converting NOTE to any token denomination, first convert to ETH via
      // the all network
      const noteInETH = this.toFiat('ETH');
      const eth = model.getTokenBySymbol('ETH');
      const ethInCurrentNetwork = TokenBalance.from(
        noteInETH.scale(
          BigNumber.from(10).pow(eth.decimals),
          noteInETH.precision
        ).n,
        eth
      );
      return token.id === eth.id
        ? ethInCurrentNetwork
        : ethInCurrentNetwork.toToken(token, riskAdjustment);
    }

    // Fetch the latest exchange rate
    const unwrapped = this.unwrapVaultToken();
    const id =
      unwrapped.tokenType === 'fCash' &&
      unwrapped.hasMatured &&
      this.isNegative()
        ? // Rewrite the fCash to a negative fCash id for settlement so that we convert to PrimeDebt
          encodeERC1155Id(
            this.currencyId,
            this.maturity,
            AssetType.FCASH_ASSET_TYPE,
            true
          )
        : unwrapped.tokenId;

    const exchangeRate: BigNumber | null = model.getExchangeRateBetweenTokens(
      id,
      token.id,
      riskAdjustment,
      timestamp
    );

    if (!exchangeRate) throw Error('No Exchange Rate');
    return new TokenBalance(
      // All exchange rates from the registry are in scalar precision
      this.scale(exchangeRate, SCALAR_PRECISION).scaleTo(token.decimals),
      token.id,
      token.network
    );
  }

  toUnderlying(atTimestamp?: number) {
    if (this.tokenType === 'Underlying') return this;
    if (this.tokenType === 'NOTE') return this;
    // Does the exchange rate conversion and decimal scaling
    return this.toToken(this.underlying, undefined, atTimestamp);
  }

  toPrimeDebt() {
    if (this.tokenType === 'PrimeDebt') return this;
    const primeDebt = NetworkModelRegistry.getModel(this.network).getPrimeDebt(
      this.currencyId
    );

    // Does the exchange rate conversion and decimal scaling
    return this.toToken(primeDebt);
  }

  toPrimeCash() {
    if (this.tokenType === 'PrimeCash') return this;
    const primeCash = NetworkModelRegistry.getModel(this.network).getPrimeCash(
      this.currencyId
    );

    // Does the exchange rate conversion and decimal scaling
    return this.toToken(primeCash);
  }

  /** Applies local currency risk adjustments only */
  toRiskAdjustedUnderlying() {
    return this.toToken(
      this.underlying,
      this.n.isNegative() ? 'Debt' : 'Asset'
    );
  }

  toFiat(symbol: FiatKeys, atTimestamp?: number) {
    const allNetwork = NetworkModelRegistry.getModel(Network.all);
    const fiatToken = allNetwork.getTokenBySymbol(symbol);

    if (this.tokenType === 'NOTE') {
      // The NOTE token is a special case which converts directly in the
      // "All" network since the only price oracle that exists is on mainnet
      const note = allNetwork.getTokenBySymbol('NOTE');
      const noteInAllNetwork = TokenBalance.from(this.n, note);
      return noteInAllNetwork.toToken(fiatToken, undefined, atTimestamp);
    } else {
      // Other tokens convert to ETH first and then go via the "All" network
      // for fiat currency conversions
      const eth = allNetwork.getTokenBySymbol('ETH');
      const valueInETH = this.toToken(eth, undefined, atTimestamp);
      const ethInAllNetwork = TokenBalance.from(
        valueInETH.n,
        allNetwork.getTokenBySymbol('ETH') as TokenDefinition
      );
      return ethInAllNetwork.toToken(fiatToken, undefined, atTimestamp);
    }
  }

  /** Does some token id manipulation for exchange rates */
  unwrapVaultToken() {
    const newToken = NetworkModelRegistry.getModel(
      this.network
    ).unwrapVaultToken(this.token);
    return TokenBalance.from(this.n, newToken);
  }
}
