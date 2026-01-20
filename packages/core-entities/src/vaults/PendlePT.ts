import {
  BASIS_POINT,
  DEX_ID,
  doSecantSearch,
  getNowSeconds,
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
import { BalanceStatementReturnType } from '../client/accounts/balance-statement';

export interface PendlePTVaultParams extends BaseVaultParams {
  marketAddress: string;
  tokenInSy: string;
  tokenOutSy: string;
}

const APPROX_PARAMS_TYPE =
  'tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps)';
const ORDER_TYPE =
  'tuple(uint256 salt, uint256 expiry, uint256 nonce, uint8 orderType, address token, address YT, address maker, address receiver, uint256 makingAmount, uint256 lnImpliedRate, uint256 failSafeRate, bytes permit)';
const FILL_ORDER_PARAMS_TYPE = `tuple(${ORDER_TYPE} order, bytes signature, uint256 makingAmount)`;
const LIMIT_ORDER_TYPE = `tuple(address limitRouter, uint256 epsSkipMarket, ${FILL_ORDER_PARAMS_TYPE}[] normalFills, ${FILL_ORDER_PARAMS_TYPE}[] flashFills, bytes optData)`;
const PENDLE_DATA_TYPE = `tuple(uint256 minPtOut, ${APPROX_PARAMS_TYPE} approxParams, ${LIMIT_ORDER_TYPE} limitOrderData)`;

interface ConvertResponseBuyPT {
  routes: {
    contractParamInfo: {
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
        }, // approxParams
        object, // swapData
        {
          epsSkipMarket: string;
          flashFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          normalFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          optData: string;
          limitRouter: string;
        } // limitOrderData
      ];
    };
    data: {
      priceImpact: number;
    };
    outputs: {
      amount: string;
      token: string;
    }[];
  }[];
}

interface ConvertResponseSellPT {
  routes: {
    contractParamInfo: {
      contractCallParams: [
        string, // receiver
        string, // market
        string, // exactPTIn
        object, // output (token info)
        {
          epsSkipMarket: string;
          flashFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          normalFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          optData: string;
          limitRouter: string;
        } // limitOrderData
      ];
    };
    data: {
      priceImpact: number;
    };
    outputs: {
      amount: string;
      token: string;
    }[];
  }[];
}

interface OrderType {
  salt: string;
  expiry: string;
  nonce: string;
  orderType: string;
  token: string;
  YT: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  lnImpliedRate: string;
  failSafeRate: string;
  permit: string;
}

export class PendlePT extends VaultAdapter {
  protected apiUrl = 'https://api-v2.pendle.finance/core/v2/sdk';
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

  getVaultShareExitToUnderlying(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    // This is only called on maxWithdraw from a vault
    if (netVaultShares.isPositive())
      throw Error(
        'getVaultShareExitToUnderlying should not be called with a positive netVaultShares'
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
      vaultTradeMetadata: tradeMetadata,
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
          (acc, trade) =>
            trade.feesPaid
              ? acc.add(trade.feesPaid.toToken(this.borrowedToken))
              : acc,
          TokenBalance.zero(this.borrowedToken)
        ),
        vaultTradeMetadata: tradeMetadata,
      };
    }
  }

  override getSimulatedAPY(
    netAmount: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[]
  ): APYData {
    // If we don't know the amount is sy, then we can't calculate the realized APY
    const amountInSy = vaultTradeMetadata?.find(
      (t) => t.dexId === DEX_ID.PENDLE
    )?.tokensSold;

    if (netAmount.isNegative() || netAmount.isZero() || !amountInSy) {
      const assetAPY = this.getVaultAPY();
      return {
        totalAPY: assetAPY,
        organicAPY: assetAPY,
        assetAPY: assetAPY,
        incentiveAPY: undefined,
        pointMultiples: undefined,
      };
    }

    const impliedExchangeRate = netAmount.toFloat() / amountInSy.toFloat();
    const timeToMaturity = this.timeToExpiry;
    const totalAPY =
      100 *
      (Math.pow(impliedExchangeRate, SECONDS_IN_YEAR_ACTUAL / timeToMaturity) -
        1);

    return {
      totalAPY,
      organicAPY: totalAPY,
      assetAPY: totalAPY,
      incentiveAPY: undefined,
      pointMultiples: undefined,
    };
  }

  override simulateWithdraw(vaultSharesToRedeem: TokenBalance) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length !== 1)
      throw Error('Withdraw manager not found');
    const tokenOutSy = model.getTokenByID(this.tokenOutSy);

    const yieldTokensRedeemed = vaultSharesToRedeem
      .toToken(this.market.ptToken)
      .toToken(tokenOutSy);
    const withdrawTokensToReceive = yieldTokensRedeemed.toToken(
      withdrawManager[0].withdrawToken
    );
    return [
      {
        estimatedWithdrawTime: withdrawManager[0].estimatedWithdrawTime,
        yieldTokensRedeemed,
        withdrawTokensToReceive,
      },
    ];
  }

  override async getInitiateWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance
  ) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length !== 1)
      throw Error('Withdraw manager not found');
    return withdrawManager[0].getWithdrawParameters(
      account,
      vaultSharesToRedeem
    );
  }
  override getWithdrawTradeMetadata(withdrawTokensBurned: TokenBalance[]) {
    if (withdrawTokensBurned.length !== 1)
      throw Error('PendlePT vault only supports one withdraw token');

    const { withdrawPoolAddress } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    return [
      this.getVaultTradeMetadata(
        withdrawTokensBurned[0],
        this.borrowedToken,
        withdrawPoolAddress
      ),
    ];
  }

  override getAdditionalAccruedInterest(
    statement: BalanceStatementReturnType
  ): TokenBalance {
    const model = getNetworkModel(this.network);
    const timeSinceLastSnapshot = getNowSeconds() - statement.timestamp;
    const timeToExpiryBefore = this.expiry - statement.timestamp;
    // Use the minimum of the time since the last snapshot and the time to expiry
    const interestAccrueTime =
      timeSinceLastSnapshot < timeToExpiryBefore
        ? timeSinceLastSnapshot
        : timeToExpiryBefore;

    const accountingAsset = model.getTokenByID(statement.accountingAssetId);
    // This is in PT token precision but we need to scale it back to the tokenOutSy
    // precision and the FX it back to the borrowed token precision
    const additionalAccruedInterest = TokenBalance.from(
      statement.lastInterestAccumulator
        .mul(interestAccrueTime)
        .div(timeToExpiryBefore)
        .mul(BigNumber.from(10).pow(accountingAsset.decimals))
        .div(BigNumber.from(10).pow(this.market.ptToken.decimals)),
      accountingAsset
    );

    return additionalAccruedInterest;
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
    let approxParams: object;
    let limitOrderData: object;

    // Floor these values at zero if they are too small can happen
    // during rolling the vault position and the Pendle API will fail
    // if the valuation is under 0.01 USD.
    if (totalDeposit.toFiat('USD').toFloat() <= 0.02) {
      minPtOut = BigNumber.from(0);
      minSYPurchaseAmount = minSYPurchaseAmount.copy(0);

      approxParams = {
        guessMin: BigNumber.from(0),
        // Increase the max guess to ensure that the search will converge
        guessMax: BigNumber.from(SCALAR_PRECISION).mul(10),
        guessOffchain: BigNumber.from(0),
        maxIteration: BigNumber.from(256),
        eps: BigNumber.from(0.0001e18),
      };
      limitOrderData = {
        limitRouter: '0x0000000000000000000000000000000000000000',
        epsSkipMarket: BigNumber.from(0),
        normalFills: [],
        flashFills: [],
        optData: '0x',
      };
    } else {
      const response = await fetch(
        `${this.apiUrl}/${NetworkId[this.network]}/convert?receiver=${
          this.vaultAddress
        }&slippage=${
          slippageFactor / RATE_PRECISION
        }&enableAggregator=false&tokensIn=${this.tokenInSy}&tokensOut=${
          this.market.ptToken.address
        }&amountsIn=${minSYPurchaseAmount.n.toString()}`
      );
      const data: ConvertResponseBuyPT = await response.json();
      minPtOut = BigNumber.from(
        data.routes[0].contractParamInfo.contractCallParams[2] as string
      );
      approxParams = data.routes[0].contractParamInfo.contractCallParams[3];
      limitOrderData = data.routes[0].contractParamInfo.contractCallParams[5];
    }

    const pendleData = defaultAbiCoder.encode(
      [PENDLE_DATA_TYPE],
      [{ minPtOut, approxParams, limitOrderData }]
    );

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes pendleData) r',
      ],
      [[dexId, minSYPurchaseAmount.n, exchangeData, pendleData]]
    );
  }

  override async getWithdrawParameters(
    _account: string,
    _vaultSharesToRedeem: TokenBalance,
    withdrawTokensBurned: TokenBalance[],
    slippageFactor = 10 * BASIS_POINT
  ): Promise<BytesLike> {
    const { dexId, withdrawExchangeData: exchangeData } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    if (withdrawTokensBurned.length !== 1)
      throw Error('PendlePT vault only supports one withdraw token');
    const minPurchaseAmount = withdrawTokensBurned[0]
      .toToken(this.borrowedToken)
      .mulInRatePrecision(slippageFactor || 0).n;

    return defaultAbiCoder.encode(
      ['tuple(uint16 dexId, uint256 minPurchaseAmount, bytes exchangeData)'],
      [
        {
          dexId,
          minPurchaseAmount,
          exchangeData,
        },
      ]
    );
  }

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 10 * BASIS_POINT
  ): Promise<BytesLike> {
    let dexId = 0;
    let exchangeData: BytesLike = '0x';
    let minPurchaseAmount: BigNumber | undefined;
    if (this.tokenOutSy !== this.borrowedToken.id) {
      // In the other case, we need to determine the default exit trade.
      ({ dexId, redeemExchangeData: exchangeData } =
        VaultDefaultDexParameters[this.network][this.vaultAddress]);

      const minTradedPurchaseAmount = this.getVaultShareExitToUnderlying(
        vaultSharesToRedeem.neg()
      ).netUnderlyingForVaultShares.mulInRatePrecision(
        RATE_PRECISION - slippageFactor
      );

      const minOraclePurchaseAmount = vaultSharesToRedeem
        .toUnderlying()
        .mulInRatePrecision(RATE_PRECISION - slippageFactor);

      // Choose the minimum of the two amounts to ensure that the trade is successful
      minPurchaseAmount = minTradedPurchaseAmount.lt(minOraclePurchaseAmount)
        ? minTradedPurchaseAmount.n
        : minOraclePurchaseAmount.n;
    }

    const response = await fetch(
      `${this.apiUrl}/${NetworkId[this.network]}/convert?receiver=${
        this.vaultAddress
      }&slippage=${
        slippageFactor / RATE_PRECISION
      }&enableAggregator=false&tokensIn=${
        this.market.ptToken.address
      }&tokensOut=${this.tokenOutSy}&amountsIn=${vaultSharesToRedeem
        .toToken(this.market.ptToken)
        .n.toString()}`
    );

    let pendleData: BytesLike = '0x';
    try {
      const data: ConvertResponseSellPT = await response.json();
      if (
        data.routes[0].contractParamInfo.contractCallParams[4].normalFills
          .length > 0 ||
        data.routes[0].contractParamInfo.contractCallParams[4].flashFills
          .length > 0
      ) {
        // Only encode the limit order data if there are normal or flash fills
        pendleData = defaultAbiCoder.encode(
          [LIMIT_ORDER_TYPE],
          [data.routes[0].contractParamInfo.contractCallParams[4]]
        );
      }

      if (this.tokenOutSy === this.borrowedToken.id) {
        minPurchaseAmount = BigNumber.from(data.routes[0].outputs[0].amount)
          .mul(RATE_PRECISION - slippageFactor)
          .div(RATE_PRECISION);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }

    if (minPurchaseAmount === undefined) {
      throw new Error('Min purchase amount is undefined');
    }

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes pendleData) r',
      ],
      [
        {
          dexId,
          minPurchaseAmount,
          exchangeData,
          pendleData,
        },
      ]
    );
  }
}
