import { BigNumber, BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import {
  DEX_ID,
  get0xData,
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { TokenDefinition, VaultTradeMetadata } from '../Definitions';
import { getNetworkModel } from '../Models';
import { APYData } from '../models/views/YieldViews';
import { BalanceStatementReturnType } from '../client/accounts/balance-statement';
import { VaultDefaultDexParameters } from '../config/whitelisted-vaults';

export interface BaseVaultParams {
  vaultAddress: string;
  enabled: boolean;
  yieldToken: string;
  strategyType: string;
}

export abstract class VaultAdapter {
  abstract get hashKey(): string;

  constructor(
    public enabled: boolean,
    public strategyType: string,
    public network: Network,
    public vaultAddress: string,
    public borrowedToken: TokenDefinition,
    public yieldToken: TokenDefinition
  ) {
    // NO-OP
  }

  /**
   * Returns the underlying received when redeeming a negative amount of vault shares
   * @returns netUnderlyingForVaultShares and feesPaid
   */
  abstract getEstimatedUnderlying(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  };

  /**
   * Returns the vault shares or redeemed for a given amount of underlying
   * @returns netVaultSharesForUnderlying and feesPaid
   */
  abstract getEstimatedVaultShares(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  };

  abstract getVaultShares(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): Promise<{
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  }>;

  abstract getWithdrawTradeMetadata(
    withdrawTokensBurned: TokenBalance[]
  ): VaultTradeMetadata[];

  abstract getDepositParameters(
    account: string,
    totalDeposit: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getRedeemParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getInitiateWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance
  ): Promise<BytesLike>;

  abstract simulateWithdraw(vaultSharesToRedeem: TokenBalance): {
    estimatedWithdrawTime: number | undefined;
    yieldTokensRedeemed: TokenBalance;
    withdrawTokensToReceive: TokenBalance;
  }[];

  abstract getWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance,
    withdrawTokensBurned: TokenBalance[],
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number;

  getVaultTVL(): TokenBalance {
    const vaultShares = getNetworkModel(this.network)
      .getTokensByType('VaultShare', false)
      .filter((t) => t.vaultAddress === this.vaultAddress);

    return vaultShares.reduce(
      (acc, v) => (v.totalSupply ? acc.add(v.totalSupply.toUnderlying()) : acc),
      TokenBalance.zero(this.borrowedToken)
    );
  }

  getPointMultiples(): Record<string, number> | undefined {
    return undefined;
  }

  abstract getLiquidationPriceTokens(): TokenDefinition[];

  abstract getSimulatedAPY(
    netAmount: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[]
  ): APYData;

  getAdditionalAccruedInterest(
    _statement: BalanceStatementReturnType
  ): TokenBalance {
    return TokenBalance.zero(this.borrowedToken);
  }

  protected getEstimatedVaultTrade(
    tokenSold: TokenBalance,
    tokenBought: TokenDefinition,
    poolAddress?: string,
    defaultSlippage = 0
  ): VaultTradeMetadata {
    let tokensBought: TokenBalance;
    let fees: TokenBalance | undefined;
    let isEstimated = true;
    let dexId = DEX_ID.UNKNOWN;

    try {
      if (poolAddress) {
        const defaultPool = getNetworkModel(this.network).getPoolInstance(
          poolAddress
        );
        const tokenOutIndex = defaultPool.balances.findIndex(
          (t) =>
            t.token.id === tokenBought.id ||
            (tokenBought.id === ZERO_ADDRESS && t.token.symbol === 'WETH')
        );
        const { tokensOut, feesPaid } = defaultPool.calculateTokenTrade(
          tokenSold,
          tokenOutIndex
        );

        tokensBought = tokensOut;
        fees =
          feesPaid.find((t) => t.tokenId === tokenSold.tokenId) ||
          tokenSold.copy(0);
        isEstimated = false;
        dexId = defaultPool.dexId;
      } else {
        tokensBought = tokenSold
          .toToken(tokenBought)
          .mulInRatePrecision(RATE_PRECISION - defaultSlippage);
        fees = tokenSold.copy(0);
      }
    } catch (e) {
      tokensBought = tokenSold
        .toToken(tokenBought)
        .mulInRatePrecision(RATE_PRECISION - defaultSlippage);
    }

    const exchangeRate = tokenSold.toFloat() / tokensBought.toFloat();
    const spotPrice =
      tokenSold.toFloat() / tokenSold.toToken(tokenBought).toFloat();

    return {
      tokensSold: tokenSold,
      tokensBought: tokensBought,
      exchangeRate,
      differenceFromSpot: exchangeRate - spotPrice,
      feesPaid: fees,
      isEstimated,
      dexId,
    };
  }

  protected async getVaultTrade(
    tokenSold: TokenBalance,
    tokenBought: TokenDefinition,
    aggregator: 'Pendle' | 'ZeroEx',
    sellEntireBalance?: boolean
  ): Promise<VaultTradeMetadata> {
    if (aggregator === 'Pendle') {
      throw Error('Pendle trade not supported');
    } else if (aggregator === 'ZeroEx') {
      const { buyAmount, limit, data } = await get0xData({
        network: this.network,
        sellToken: tokenSold.tokenId,
        buyToken: tokenBought.id,
        sellAmount: tokenSold.n,
        slippageBPS: 10,
        taker: this.vaultAddress,
        sellEntireBalance,
      });
      const tokensBought = TokenBalance.from(buyAmount, tokenBought);
      const exchangeRate = tokensBought.toFloat() / tokenSold.toFloat();
      const spotPrice =
        tokenSold.toFloat() / tokenSold.toToken(tokenBought).toFloat();

      return {
        tokensSold: tokenSold,
        tokensBought,
        exchangeRate,
        differenceFromSpot: exchangeRate - spotPrice,
        // TODO: get fees from 0x data
        feesPaid: TokenBalance.zero(tokenBought),
        isEstimated: false,
        dexId: DEX_ID.ZERO_EX,
        minPurchaseAmount: TokenBalance.from(limit, tokenBought),
        exchangeData: data,
      };
    } else {
      throw Error(`Unsupported aggregator: ${aggregator}`);
    }
  }

  protected getExchangeData(
    vaultTradeMetadata: VaultTradeMetadata[] | undefined,
    exchangeKey: 'deposit' | 'redeem' | 'withdraw',
    defaultMinPurchaseAmount: BigNumber
  ): { dexId: number; exchangeData: BytesLike; minPurchaseAmount: BigNumber } {
    const zeroExTrade = vaultTradeMetadata?.find(
      (t) => t.dexId === DEX_ID.ZERO_EX
    );
    if (zeroExTrade) {
      if (!zeroExTrade.minPurchaseAmount || !zeroExTrade.exchangeData)
        throw Error(
          'ZeroEx trade metadata is missing min purchase amount or exchange data'
        );
      return {
        dexId: zeroExTrade.dexId,
        exchangeData: zeroExTrade.exchangeData,
        minPurchaseAmount: zeroExTrade.minPurchaseAmount.n,
      };
    } else {
      const defaultDex =
        VaultDefaultDexParameters[this.network][this.vaultAddress];
      if (!defaultDex) throw Error('Default dex not found');

      return {
        dexId: defaultDex.dexId,
        exchangeData: defaultDex[exchangeKey + 'ExchangeData'],
        minPurchaseAmount: defaultMinPurchaseAmount,
      };
    }
  }
}
