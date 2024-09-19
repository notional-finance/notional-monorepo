import {
  BASIS_POINT,
  DexIds,
  getNowSeconds,
  INTERNAL_TOKEN_DECIMALS,
  Network,
  NetworkId,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { TokenBalance } from '../token-balance';
import { Registry } from '../Registry';
import { BigNumber, BytesLike } from 'ethers';
import { PendleMarket } from '../exchanges';
import { ExchangeRate, TokenDefinition } from '../Definitions';
import { defaultAbiCoder } from '@ethersproject/abi';

export interface PendlePTVaultParams extends BaseVaultParams {
  marketAddress: string;
  tokenInSy: string;
  tokenOutSy: string;
}

const DexParameters: Record<
  Network,
  Record<string, { dexId: DexIds; exchangeData: BytesLike }>
> = {
  [Network.arbitrum]: {
    '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3': {
      dexId: DexIds.BALANCER_V2,
      exchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
    },
  },
  [Network.mainnet]: {},
  [Network.optimism]: {},
  [Network.all]: {},
};

export class PendlePT extends VaultAdapter {
  protected apiUrl = 'https://api-v2.pendle.finance/core/v1/sdk/';
  public tokenInSy: string;
  public tokenOutSy: string;
  public marketAddress: string;
  protected market: PendleMarket;

  get strategy() {
    return 'PendlePT';
  }

  constructor(network: Network, vaultAddress: string, p: PendlePTVaultParams) {
    super(p.enabled, p.name, network, vaultAddress);
    this.tokenInSy = p.tokenInSy;
    this.tokenOutSy = p.tokenOutSy;
    this.marketAddress = p.marketAddress;
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
    // TODO: net underlying has to be scaled to the tokenSyIn
    const { tokensOut, feesPaid } = this.market.calculateTokenTrade(
      netUnderlying,
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
    totalDeposit: TokenBalance,
    slippageFactor = 50 * BASIS_POINT
  ): Promise<BytesLike> {
    const { dexId, exchangeData } =
      DexParameters[this.network][this.vaultAddress];

    // Apply some slippage limit to the oracle price on the deposit
    const minPurchaseAmount = this.market
      .convertAssetToSY(totalDeposit)
      .mulInRatePrecision(RATE_PRECISION - slippageFactor);

    const response = await fetch(
      `${this.apiUrl}/${NetworkId[this.network]}/markets/${
        this.marketAddress
      }/swap?receiver=${this.vaultAddress}&slippage=${
        slippageFactor / RATE_PRECISION
      }&enableAggregator=false&tokenIn=${this.tokenInSy}&tokenOut=${
        this.market.ptToken.address
      }&amountIn=${minPurchaseAmount.n.toString()}`
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

    const minPtOut = BigNumber.from(data.contractCallParams[2] as string);

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, uint256 minPtOut, tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps)) r',
      ],
      [
        [
          dexId,
          minPurchaseAmount.n,
          exchangeData,
          minPtOut,
          [
            BigNumber.from(data.contractCallParams[3].guessMin),
            BigNumber.from(data.contractCallParams[3].guessMax),
            BigNumber.from(data.contractCallParams[3].guessOffchain),
            BigNumber.from(data.contractCallParams[3].maxIteration),
            BigNumber.from(data.contractCallParams[3].eps),
          ],
        ],
      ]
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
        DexParameters[this.network][this.vaultAddress];

      const minPurchaseAmount = this.market
        .convertAssetToSY(vaultSharesToRedeem.toUnderlying())
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
