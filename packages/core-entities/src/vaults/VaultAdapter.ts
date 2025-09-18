import { BytesLike } from 'ethers';
import { TokenBalance } from '../token-balance';
import {
  BASIS_POINT,
  DEX_ID,
  Network,
  RATE_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { TokenDefinition, VaultTradeMetadata } from '../Definitions';
import { getNetworkModel } from '../Models';
import { APYData } from '../models/views/YieldViews';

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
  abstract getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  };

  /**
   * Returns the vault shares or redeemed for a given amount of underlying
   * @returns netVaultSharesForUnderlying and feesPaid
   */
  abstract getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  };

  getWithdrawTradeMetadata(
    _withdrawTokensBurned: TokenBalance
  ): VaultTradeMetadata[] {
    throw new Error('Not implemented');
  }

  abstract getDepositParameters(
    account: string,
    maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getRedeemParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getWithdrawParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance,
    slippageFactor?: number
  ): Promise<BytesLike>;

  abstract getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number;

  getRewardAPY(): number {
    return 0;
  }

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

  protected getVaultTradeMetadata(
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
}
