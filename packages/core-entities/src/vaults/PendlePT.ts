import {
  getNowSeconds,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { TokenBalance } from '../token-balance';
import { Registry } from '../Registry';
import { BytesLike } from 'ethers';
import { PendleMarket } from '../exchanges';
import { ExchangeRate, TokenDefinition } from '../Definitions';
import { defaultAbiCoder } from '@ethersproject/abi';

export interface PendlePTVaultParams extends BaseVaultParams {
  marketAddress: string;
  tokenInSy: string;
  tokenOutSy: string;
}

export class PendlePT extends VaultAdapter {
  protected apiUrl = 'https://api-v2.pendle.finance/sdk/v1';
  public tokenInSy: string;
  public tokenOutSy: string;
  protected market: PendleMarket;

  get strategy() {
    return 'PendlePT';
  }

  constructor(network: Network, vaultAddress: string, p: PendlePTVaultParams) {
    super(p.enabled, p.name, network, vaultAddress);
    this.tokenInSy = p.tokenInSy;
    this.tokenOutSy = p.tokenOutSy;
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

  getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    const ptTokens = TokenBalance.from(netVaultShares.n, this.market.ptToken)
      .scaleFromInternal()
      .neg();

    // Calculate the cost to purchase the PT
    const { tokensOut, feesPaid } = this.market.calculateTokenTrade(
      ptTokens.neg(),
      this.market.TOKEN_IN_INDEX
    );
    return {
      netUnderlyingForVaultShares: tokensOut,
      feesPaid: feesPaid[0],
    };
  }

  getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  } {
    // Calculate the amount received for selling the PT
    const { tokensOut, feesPaid } = this.market.calculateTokenTrade(
      netUnderlying.neg(),
      this.market.PT_TOKEN_INDEX
    );

    return {
      netVaultSharesForUnderlying: TokenBalance.from(
        tokensOut.scaleTo(INTERNAL_TOKEN_DECIMALS),
        vaultShare
      ),
      feesPaid: feesPaid[0],
    };
  }

  override async getDepositParameters(
    _account: string,
    _maturity: number,
    _totalDeposit: TokenBalance,
    _slippageFactor?: number
  ): Promise<BytesLike> {
    // TODO: get this data from the api
    return '0x';
    /**
     * struct PendleDepositParams {
     *    // for trade execution from borrowed token to token in sy
     *    uint16 dexId;
     *    uint256 minPurchaseAmount;
     *    bytes exchangeData;
     *    // slippage factor for PT token
     *    uint256 minPtOut;
     *    // approx params for PT trade execution, fetched via pendle API
     *    IPRouter.ApproxParams approxParams;
     *}
     */
  }

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    _vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    _slippageFactor?: number
  ): Promise<BytesLike> {
    if (this.tokenOutSy === this.getBorrowedToken().id) {
      return '0x';
    } else {
      // In the other case, we need to determine the default exit trade.
      // TODO: fix this....
      return defaultAbiCoder.encode(
        ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData) r'],
        [
          {
            dexId: 0,
            minPurchaseAmount: 0,
            exchangeData: '0x',
          },
        ]
      );
    }
  }
}
