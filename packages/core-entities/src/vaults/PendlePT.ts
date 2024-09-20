import {
  BASIS_POINT,
  doSecantSearch,
  FLOATING_POINT_DUST,
  getNowSeconds,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  NetworkId,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SCALAR_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { TokenBalance } from '../token-balance';
import { Registry } from '../Registry';
import { BigNumber, BytesLike } from 'ethers';
import { PendleMarket } from '../exchanges';
import { ExchangeRate, TokenDefinition } from '../Definitions';
import { defaultAbiCoder } from '@ethersproject/abi';
import { VaultDefaultDexParameters } from '../config/whitelisted-vaults';
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

  get strategy() {
    return 'PendlePT';
  }

  constructor(network: Network, vaultAddress: string, p: PendlePTVaultParams) {
    super(p.enabled, p.name, network, vaultAddress);
    this.tokenInSy = p.tokenInSy.toLowerCase();
    this.tokenOutSy = p.tokenOutSy.toLowerCase();
    this.marketAddress = p.marketAddress.toLowerCase();
    this.market = Registry.getExchangeRegistry().getPoolInstance<PendleMarket>(
      network,
      p.marketAddress
    );
  }

  getVaultAPY(): number {
    return this.market.ptSpotYieldToMaturity;
  }

  get timeToExpiry(): number {
    return this.market.timeToExpiry;
  }

  get hashKey() {
    return [this.vaultAddress].join(':');
  }

  getInitialVaultShareValuation(): ExchangeRate {
    const oneAssetUnit = TokenBalance.fromID(
      this.market.ptExchangeRate,
      this.market.assetTokenId,
      this.network
    );

    return {
      rate: oneAssetUnit.toToken(this.getBorrowedToken()).n,
      timestamp: getNowSeconds(),
      blockNumber: 0,
    };
  }

  convertToPrimeVaultShares(vaultShares: TokenBalance): TokenBalance {
    // Prime vault shares convert 1-1
    const token = Registry.getTokenRegistry().getVaultShare(
      vaultShares.network,
      vaultShares.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    return TokenBalance.from(vaultShares.n, token);
  }

  unwrapToSyOutToken(token: TokenBalance) {
    if (token.tokenId === this.tokenInSy) {
      return token;
    } else {
      if (!token.symbol.startsWith('SY')) throw Error('Invalid SY token');
      return TokenBalance.fromID(token.n, this.tokenOutSy, this.network);
    }
  }

  calculateTradeToSy(
    underlyingIn: TokenBalance,
    defaultSlippage = 50 * BASIS_POINT
  ): {
    tokensInSy: TokenBalance;
    tradingFeesPaid: TokenBalance;
  } {
    // Short circuit if borrowed token is the tokenInSy
    if (underlyingIn.tokenId === this.tokenInSy) {
      return {
        tokensInSy: underlyingIn,
        tradingFeesPaid: underlyingIn.copy(0),
      };
    }

    const { poolAddress } = VaultDefaultDexParameters[this.network][this.vaultAddress];
    if (poolAddress) {
      const tokenSyPool = Registry.getExchangeRegistry().getPoolInstance(
        this.network,
        poolAddress
      );
      const tokenOutIndex = tokenSyPool.balances.findIndex(
        (t) =>
          t.token.id === this.tokenInSy ||
          (this.tokenInSy === ZERO_ADDRESS && t.token.symbol === 'WETH')
      );
      const { tokensOut, feesPaid } = tokenSyPool.calculateTokenTrade(
        underlyingIn,
        tokenOutIndex
      );

      return {
        tokensInSy: tokensOut,
        tradingFeesPaid:
          feesPaid.find((t) => t.tokenId === underlyingIn.tokenId) ||
          underlyingIn.copy(0),
      };
    } else {
      // If we don't have the pool address, then don't do the trade and just use the oracle
      // price given my the PT market.
      return {
        tokensInSy: this.market
          .convertAssetToSy(underlyingIn)
          .mulInRatePrecision(RATE_PRECISION - defaultSlippage),
        tradingFeesPaid: underlyingIn.copy(0),
      };
    }
  }

  calculateTradeFromSy(
    tokenOutSy: TokenBalance,
    defaultSlippage = 50 * BASIS_POINT
  ): {
    underlyingOut: TokenBalance;
    tradingFeesPaid: TokenBalance;
  } {
    // Short circuit if borrowed token is the tokenInSy
    const borrowedToken = this.getBorrowedToken();
    if (tokenOutSy.tokenId === borrowedToken.id) {
      return {
        underlyingOut: tokenOutSy,
        tradingFeesPaid: tokenOutSy.copy(0),
      };
    }

    const { poolAddress } = VaultDefaultDexParameters[this.network][this.vaultAddress];
    if (poolAddress) {
      const tokenSyPool = Registry.getExchangeRegistry().getPoolInstance(
        this.network,
        poolAddress
      );
      const tokenOutIndex = tokenSyPool.balances.findIndex(
        (t) =>
          t.token.id === borrowedToken.id ||
          (borrowedToken.symbol === 'ETH' && t.token.symbol === 'WETH')
      );
      const { tokensOut, feesPaid } = tokenSyPool.calculateTokenTrade(
        tokenOutSy,
        tokenOutIndex
      );

      return {
        underlyingOut: tokensOut,
        tradingFeesPaid:
          feesPaid.find((t) => t.tokenId === borrowedToken.id) ||
          tokenOutSy.copy(0),
      };
    } else {
      // If we don't have the pool address, then don't do the trade and just use the oracle
      // price given my the PT market.
      return {
        underlyingOut: this.market
          .convertSyToAsset(tokenOutSy)
          .mulInRatePrecision(RATE_PRECISION - defaultSlippage),
        tradingFeesPaid: tokenOutSy.copy(0),
      };
    }
  }

  getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    const ptTokens = TokenBalance.from(netVaultShares.n, this.market.ptToken)
      .scaleFromInternal()
      .neg();

    // Calculate the cost to purchase the PT
    const { tokensOut: tokensOutSy, feesPaid } =
      this.market.calculateTokenTrade(
        ptTokens.neg(),
        this.market.TOKEN_IN_INDEX
      );

    const { underlyingOut, tradingFeesPaid } = this.calculateTradeFromSy(
      this.unwrapToSyOutToken(tokensOutSy)
    );

    return {
      netUnderlyingForVaultShares: underlyingOut,
      feesPaid: tradingFeesPaid.add(this.market.convertSyToAsset(feesPaid[0])),
    };
  }

  getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  } {
    if (netUnderlying.isPositive()) {
      // On way in, netUnderlying is traded to tokenInSy
      const { tokensInSy, tradingFeesPaid } =
        this.calculateTradeToSy(netUnderlying);

      // Calculate the amount received for selling the PT
      const { tokensOut: ptTokensOut, feesPaid } =
        this.market.calculateTokenTrade(tokensInSy, this.market.PT_TOKEN_INDEX);

      return {
        netVaultSharesForUnderlying: TokenBalance.from(
          ptTokensOut.scaleTo(INTERNAL_TOKEN_DECIMALS),
          vaultShare
        ),
        feesPaid: this.market
          .convertSyToAsset(feesPaid[0])
          .add(tradingFeesPaid),
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

      const { ptTokensIn, feesPaid } = doSecantSearch(
        approxPTExchangeRate,
        RATE_PRECISION,
        (exRate: number) => {
          const ptTokensIn = initialPtTokens.mulInRatePrecision(exRate);

          const { tokensOut: _tokenOutSy, feesPaid } =
            this.market.calculateTokenTrade(
              ptTokensIn,
              this.market.TOKEN_IN_INDEX
            );
          const tokenOutSy = this.unwrapToSyOutToken(_tokenOutSy);
          const { underlyingOut, tradingFeesPaid } =
            this.calculateTradeFromSy(tokenOutSy);

          return {
            fx: underlyingOut.neg().toFloat() - netUnderlying.toFloat(),
            value: {
              ptTokensIn,
              feesPaid: this.market
                .convertSyToAsset(feesPaid[0])
                .add(tradingFeesPaid),
            },
          };
        }
      );

      return {
        netVaultSharesForUnderlying: TokenBalance.from(
          ptTokensIn.scaleTo(INTERNAL_TOKEN_DECIMALS),
          vaultShare
        ).neg(),
        feesPaid: feesPaid,
      };
    }
  }

  override getMaxCollateralSlippage(): number | null {
    return 50 * BASIS_POINT;
  }

  override async getDepositParameters(
    _account: string,
    _maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor = 50 * BASIS_POINT
  ): Promise<BytesLike> {
    const { dexId, exchangeData } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];

    // Apply some slippage limit to the oracle price on the deposit
    let minSYPurchaseAmount = this.market
      .convertAssetToSy(totalDeposit)
      .mulInRatePrecision(RATE_PRECISION - slippageFactor);
    let minPtOut: BigNumber;
    let approxParams: BigNumber[];

    // Floor these values at zero if they are too small
    if (minSYPurchaseAmount.toFloat() <= FLOATING_POINT_DUST) {
      minPtOut = BigNumber.from(0);
      minSYPurchaseAmount = minSYPurchaseAmount.copy(0);

      approxParams = [
        BigNumber.from(0),
        BigNumber.from(SCALAR_PRECISION),
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

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 50 * BASIS_POINT
  ): Promise<BytesLike> {
    if (this.tokenOutSy === this.getBorrowedToken().id) {
      return '0x';
    } else {
      // In the other case, we need to determine the default exit trade.
      const { dexId, exchangeData } =
        VaultDefaultDexParameters[this.network][this.vaultAddress];

      const minPurchaseAmount = this.market
        .convertAssetToSy(vaultSharesToRedeem.toUnderlying())
        .mulInRatePrecision(RATE_PRECISION - slippageFactor);

      return defaultAbiCoder.encode(
        ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData) r'],
        [
          {
            dexId,
            minPurchaseAmount: minPurchaseAmount.n,
            exchangeData,
          },
        ]
      );
    }
  }
}
