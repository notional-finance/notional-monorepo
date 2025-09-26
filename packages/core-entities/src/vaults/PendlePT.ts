import {
  BASIS_POINT,
  DEX_ID,
  doSecantSearch,
  lastValue,
  Network,
  NetworkId,
  RATE_PRECISION,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { TokenBalance } from '../token-balance';
import { getNetworkModel } from '../Models';
import { BigNumber, BytesLike } from 'ethers';
import { PendleMarket } from '../exchanges';
import { TokenDefinition, VaultTradeMetadata } from '../Definitions';
import { defaultAbiCoder } from '@ethersproject/abi';
import { VaultDefaultDexParameters } from '../config/whitelisted-vaults';
import { APYData } from '../models/views/YieldViews';
import { registerTokensMap } from '../exchanges/default-pools';

export interface PendlePTVaultParams extends BaseVaultParams {
  marketAddress: string;
  tokenInSy: string;
  tokenOutSy: string;
}

export class PendlePT extends VaultAdapter {
  protected apiUrl = 'https://api-v2.pendle.finance/core/v1/sdk';
  public tokenInSy: string;
  public tokenOutSy: string;
  public marketAddress: string;
  protected market: PendleMarket;

  constructor(
    network: Network,
    vaultAddress: string,
    p: PendlePTVaultParams,
    borrowedToken: TokenDefinition,
    yieldToken: TokenDefinition
  ) {
    super(
      p.enabled,
      p.strategyType,
      network,
      vaultAddress,
      borrowedToken,
      yieldToken
    );
    this.tokenInSy = p.tokenInSy.toLowerCase();
    this.tokenOutSy = p.tokenOutSy.toLowerCase();
    this.marketAddress = p.marketAddress.toLowerCase();
    this.market = getNetworkModel(this.network).getPoolInstance<PendleMarket>(
      p.marketAddress
    );
  }

  getLiquidationPriceTokens() {
    return [this.market.ptToken];
  }

  getVaultAPY(): number {
    return this.market.ptSpotYieldToMaturity;
  }

  get expiry(): number {
    return this.market.poolParams.marketState.expiry.toNumber();
  }

  get timeToExpiry(): number {
    return this.market.timeToExpiry;
  }

  get isExpired(): boolean {
    return this.timeToExpiry === 0;
  }

  get hashKey() {
    return [this.vaultAddress].join(':');
  }

  get isBorrowSameAsAsset(): boolean {
    return this.market.assetTokenId === this.borrowedToken.id;
  }

  get assetToken(): TokenDefinition {
    return getNetworkModel(this.network).getTokenByID(this.market.assetTokenId);
  }

  unwrapToSyOutToken(token: TokenBalance) {
    if (token.tokenId === this.tokenInSy) {
      return token;
    } else {
      if (!token.symbol.startsWith('SY')) throw Error('Invalid SY token');
      return new TokenBalance(token.n, this.tokenOutSy, this.network);
    }
  }

  calculateTradeToSy(
    underlyingIn: TokenBalance,
    defaultSlippage = 50 * BASIS_POINT
  ): VaultTradeMetadata | undefined {
    // Short circuit if borrowed token is the tokenInSy
    if (underlyingIn.tokenId === this.tokenInSy) return undefined;

    const { depositPoolAddress } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    if (depositPoolAddress) {
      return this.getVaultTradeMetadata(
        underlyingIn,
        this.assetToken,
        depositPoolAddress,
        defaultSlippage
      );
    } else {
      // If we don't have the pool address, then don't do the trade and just use the oracle
      // price given my the PT market.
      const tokensBought = this.market
        .convertAssetToSy(underlyingIn)
        .mulInRatePrecision(RATE_PRECISION - defaultSlippage);

      return {
        tokensSold: underlyingIn,
        tokensBought,
        exchangeRate: underlyingIn.toFloat() / tokensBought.toFloat(),
        differenceFromSpot: defaultSlippage / RATE_PRECISION,
        feesPaid: underlyingIn.copy(0),
        isEstimated: true,
        dexId: DEX_ID.UNKNOWN,
      };
    }
  }

  calculateTradeFromSy(
    tokenOutSy: TokenBalance,
    defaultSlippage = 50 * BASIS_POINT
  ): VaultTradeMetadata[] | undefined {
    // Short circuit if borrowed token is the tokenInSy
    if (tokenOutSy.tokenId === this.borrowedToken.id) return undefined;

    const vaultTradeMetadata: VaultTradeMetadata[] = [];

    const { redeemPoolAddress } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    if (redeemPoolAddress) {
      let _tokenOutSy = tokenOutSy;

      if (tokenOutSy.symbol === 'sUSDe') {
        // For sUSDe we need to trade to sDAI and then redeem the sDAI to DAI before
        // we execute the following trade.
        const sDAITrade = this.getVaultTradeMetadata(
          tokenOutSy,
          getNetworkModel(this.network).getTokenBySymbol('sDAI'),
          registerTokensMap[this.network]['sDAI/sUSDe']
        );
        vaultTradeMetadata.push(sDAITrade);

        _tokenOutSy = sDAITrade.tokensBought;
      }

      const trade = this.getVaultTradeMetadata(
        _tokenOutSy,
        this.borrowedToken,
        redeemPoolAddress
      );
      vaultTradeMetadata.push(trade);
    } else {
      // If we don't have the pool address, then don't do the trade and just use the oracle
      // price given my the PT market.
      const tokensBought = this.market
        .convertSyToAsset(tokenOutSy)
        .mulInRatePrecision(RATE_PRECISION - defaultSlippage);
      vaultTradeMetadata.push({
        tokensSold: tokenOutSy,
        tokensBought,
        exchangeRate: tokenOutSy.toFloat() / tokensBought.toFloat(),
        differenceFromSpot: defaultSlippage / RATE_PRECISION,
        feesPaid: tokenOutSy.copy(0),
        isEstimated: true,
        dexId: DEX_ID.UNKNOWN,
      });
    }

    return vaultTradeMetadata;
  }

  getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    // This is only called on maxWithdraw from a vault
    if (netVaultShares.isPositive())
      throw Error(
        'getNetVaultSharesCost should not be called with a positive netVaultShares'
      );

    const ptTokens = TokenBalance.from(
      netVaultShares.n,
      this.market.ptToken
    ).scaleFromInternal();

    // Calculate the cost to sell the PT, receive tokenOutSy in return
    const { tokensOut: tokensOutSy, feesPaid } =
      this.market.calculateTokenTrade(
        ptTokens.abs(),
        this.market.TOKEN_IN_INDEX
      );

    const tradeMetadata = this.calculateTradeFromSy(
      this.unwrapToSyOutToken(tokensOutSy)
    );

    const netUnderlyingForVaultShares = tradeMetadata
      ? lastValue(tradeMetadata)?.tokensBought || tokensOutSy
      : tokensOutSy;
    const tradingFeesPaid = tradeMetadata
      ? lastValue(tradeMetadata)?.feesPaid ||
        netUnderlyingForVaultShares.copy(0)
      : feesPaid[0].copy(0);

    return {
      netUnderlyingForVaultShares,
      feesPaid: tradingFeesPaid.add(
        this.market.convertSyToAsset(feesPaid[0]).toToken(tradingFeesPaid.token)
      ),
    };
  }

  getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    const vaultTradeMetadata: VaultTradeMetadata[] = [];

    if (netUnderlying.isPositive()) {
      // On way in, netUnderlying is traded to tokenInSy
      const tradeMetadata = this.calculateTradeToSy(netUnderlying);

      let tokensInSy: TokenBalance;
      let tradingFeesPaid: TokenBalance;
      if (tradeMetadata) {
        vaultTradeMetadata.push(tradeMetadata);
        tokensInSy = tradeMetadata.tokensBought;
        tradingFeesPaid = tradeMetadata.feesPaid || netUnderlying.copy(0);
      } else {
        tokensInSy = netUnderlying;
        tradingFeesPaid = netUnderlying.copy(0);
      }

      // Calculate the amount received for selling the PT
      const { tokensOut: ptTokensOut, feesPaid } =
        this.market.calculateTokenTrade(tokensInSy, this.market.PT_TOKEN_INDEX);
      const exchangeRate = tokensInSy.toFloat() / ptTokensOut.toFloat();
      const differenceFromSpot = exchangeRate - this.market.ptExchangeRate;
      const pendleFeesPaid = this.market
        .convertSyToAsset(feesPaid[0])
        // Ensure that this is converted to the underlying
        .toToken(netUnderlying.token);

      vaultTradeMetadata.push({
        tokensSold: tokensInSy,
        tokensBought: ptTokensOut,
        exchangeRate,
        differenceFromSpot,
        feesPaid: pendleFeesPaid,
        isEstimated: false,
        dexId: DEX_ID.PENDLE,
      });

      return {
        netVaultSharesForUnderlying: TokenBalance.from(
          ptTokensOut.scaleTo(vaultShare.decimals),
          vaultShare
        ),
        feesPaid: pendleFeesPaid.add(tradingFeesPaid),
        vaultTradeMetadata,
      };
    } else {
      // On way out, tokenOutSy is traded to netUnderlying, need to figure out how many PTs to sell
      // in order to generate the netUnderlying amount.
      const initialPtTokens = TokenBalance.fromFloat(
        netUnderlying.neg().toFloat(),
        this.market.ptToken
      );
      const approxPTExchangeRate = Math.floor(
        this.market.ptExchangeRate * RATE_PRECISION
      );

      const { ptTokensIn, tradeMetadata } = doSecantSearch(
        Math.floor(approxPTExchangeRate / 2),
        approxPTExchangeRate,
        (exRate: number) => {
          const tradeMetadata: VaultTradeMetadata[] = [];
          const ptTokensIn = initialPtTokens.mulInRatePrecision(exRate);

          const { tokensOut: _tokenOutSy, feesPaid } =
            this.market.calculateTokenTrade(
              ptTokensIn,
              this.market.TOKEN_IN_INDEX
            );
          vaultTradeMetadata.push({
            tokensSold: ptTokensIn,
            tokensBought: _tokenOutSy,
            exchangeRate: ptTokensIn.toFloat() / _tokenOutSy.toFloat(),
            differenceFromSpot:
              ptTokensIn.toFloat() / _tokenOutSy.toFloat() -
              this.market.ptExchangeRate,
            feesPaid: this.market.convertSyToAsset(feesPaid[0]),
            isEstimated: false,
            dexId: DEX_ID.PENDLE,
          });

          const tokenOutSy = this.unwrapToSyOutToken(_tokenOutSy);
          tradeMetadata.push(...(this.calculateTradeFromSy(tokenOutSy) || []));

          const underlyingOut = tradeMetadata
            ? lastValue(tradeMetadata)?.tokensBought || tokenOutSy
            : tokenOutSy;

          return {
            fx: underlyingOut.toFloat() - netUnderlying.neg().toFloat(),
            value: {
              ptTokensIn,
              tradeMetadata,
            },
          };
        }
      );

      return {
        netVaultSharesForUnderlying: TokenBalance.from(
          ptTokensIn.scaleTo(vaultShare.decimals),
          vaultShare
        ).neg(),
        feesPaid: tradeMetadata.reduce(
          (acc, trade) => (trade.feesPaid ? acc.add(trade.feesPaid) : acc),
          TokenBalance.zero(this.borrowedToken)
        ),
        vaultTradeMetadata: tradeMetadata,
      };
    }
  }

  override getSimulatedAPY(
    netAmount: TokenBalance,
    vaultTradeMetadata?: unknown
  ): APYData {
    if (
      netAmount.isNegative() ||
      netAmount.isZero() ||
      !vaultTradeMetadata ||
      !!vaultTradeMetadata['tokenOutSy']
    ) {
      return {
        totalAPY: this.getVaultAPY(),
        organicAPY: this.getVaultAPY(),
        incentiveAPY: undefined,
        pointMultiples: undefined,
      };
    }

    // Use the tokens in sy to mark the realized amount so that the interest rate
    // does not include any exchange rate deviations from the borrowed asset to
    // the PT accounting asset.
    const amountInSy = (vaultTradeMetadata as { tokensInSy: TokenBalance })
      .tokensInSy;

    const impliedExchangeRate = netAmount.toFloat() / amountInSy.toFloat();
    const timeToMaturity = this.timeToExpiry;
    const totalAPY =
      100 *
      (Math.pow(impliedExchangeRate, SECONDS_IN_YEAR_ACTUAL / timeToMaturity) -
        1);

    return {
      totalAPY,
      organicAPY: totalAPY,
      incentiveAPY: undefined,
      pointMultiples: undefined,
    };
  }

  override async getDepositParameters(
    _account: string,
    _maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor = 25 * BASIS_POINT
  ): Promise<BytesLike> {
    const { dexId, depositExchangeData: exchangeData } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];

    // Apply some slippage limit to the oracle price on the deposit
    let minSYPurchaseAmount = this.market
      .convertAssetToSy(totalDeposit)
      .mulInRatePrecision(RATE_PRECISION - slippageFactor);
    let minPtOut: BigNumber;
    let approxParams: BigNumber[];

    // Floor these values at zero if they are too small can happen
    // during rolling the vault position and the Pendle API will fail
    // if the valuation is under 0.01 USD.
    if (totalDeposit.toFiat('USD').toFloat() <= 0.02) {
      minPtOut = BigNumber.from(0);
      minSYPurchaseAmount = minSYPurchaseAmount.copy(0);

      approxParams = [
        BigNumber.from(0),
        // Increase the max guess to ensure that the search will converge
        BigNumber.from(SCALAR_PRECISION).mul(10),
        BigNumber.from(0),
        BigNumber.from(256),
        BigNumber.from(0.0001e18),
      ];
    } else {
      const response = await fetch(
        `${this.apiUrl}/${NetworkId[this.network]}/markets/${
          this.marketAddress
        }/swap?receiver=${this.vaultAddress}&slippage=${
          slippageFactor / RATE_PRECISION
        }&enableAggregator=false&tokenIn=${this.tokenInSy}&tokenOut=${
          this.market.ptToken.address
        }&amountIn=${minSYPurchaseAmount.n.toString()}`
      );
      const data: {
        contractCallParams: [
          string,
          string,
          string,
          {
            eps: string;
            guessMax: string;
            guessMin: string;
            guessOffchain: string;
            maxIteration: string;
          }
        ];
        data: {
          amountOut: string;
          priceImpact: number;
        };
      } = await response.json();
      minPtOut = BigNumber.from(data.contractCallParams[2] as string);
      approxParams = [
        BigNumber.from(data.contractCallParams[3].guessMin),
        BigNumber.from(data.contractCallParams[3].guessMax),
        BigNumber.from(data.contractCallParams[3].guessOffchain),
        BigNumber.from(data.contractCallParams[3].maxIteration),
        BigNumber.from(data.contractCallParams[3].eps),
      ];
    }

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, uint256 minPtOut, tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps)) r',
      ],
      [[dexId, minSYPurchaseAmount.n, exchangeData, minPtOut, approxParams]]
    );
  }

  override async getWithdrawParameters(
    _account: string,
    _maturity: number,
    _vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    _slippageFactor = 10 * BASIS_POINT
  ): Promise<BytesLike> {
    throw new Error('Not implemented');
  }

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 10 * BASIS_POINT
  ): Promise<BytesLike> {
    if (this.tokenOutSy === this.borrowedToken.id) {
      return '0x';
    } else {
      // In the other case, we need to determine the default exit trade.
      const { dexId, redeemExchangeData: exchangeData } =
        VaultDefaultDexParameters[this.network][this.vaultAddress];

      const minTradedPurchaseAmount = this.getNetVaultSharesCost(
        vaultSharesToRedeem.neg()
      ).netUnderlyingForVaultShares.mulInRatePrecision(
        RATE_PRECISION - slippageFactor
      );

      const minOraclePurchaseAmount = vaultSharesToRedeem
        .toUnderlying()
        .mulInRatePrecision(RATE_PRECISION - slippageFactor);

      console.log(
        'minTradedPurchaseAmount',
        minTradedPurchaseAmount.toExactString()
      );
      console.log(
        'minOraclePurchaseAmount',
        minOraclePurchaseAmount.toExactString()
      );

      return defaultAbiCoder.encode(
        ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData) r'],
        [
          {
            dexId,
            // Choose the minimum of the two amounts to ensure that the trade is successful
            minPurchaseAmount: minTradedPurchaseAmount.lt(
              minOraclePurchaseAmount
            )
              ? minTradedPurchaseAmount.n
              : minOraclePurchaseAmount.n,
            exchangeData,
          },
        ]
      );
    }
  }
}
